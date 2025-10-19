import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { db } from "../config/db.js";

dotenv.config();
const router = express.Router();

// Helper: get M-Pesa access token
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
}

// 🟢 STK Push initiation
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, orderId, userId } = req.body;
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${process.env.BASE_URL}/api/pay/callback`,
        AccountReference: "EcommerceOrder",
        TransactionDesc: `Order ${orderId}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutRequestID = response.data.CheckoutRequestID;

    // Save payment as pending
    await db.run(
      `INSERT INTO payments (user_id, order_id, amount, status, checkout_request_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, orderId, amount, "pending", checkoutRequestID]
    );

    res.json({
      message: "STK push initiated. Complete payment on your phone.",
      checkoutRequestID,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "STK Push failed" });
  }
});

// 🟢 Callback from M-Pesa
router.post("/callback", async (req, res) => {
  try {
    const result = req.body.Body.stkCallback;
    console.log(
      "📩 M-Pesa Callback Received:",
      JSON.stringify(result, null, 2)
    );

    if (result.ResultCode === 0) {
      const { CheckoutRequestID, CallbackMetadata } = result;
      const amount = CallbackMetadata.Item.find(
        (i) => i.Name === "Amount"
      ).Value;

      // Mark payment as success
      await db.run(
        `UPDATE payments
         SET status = ?, amount = ?
         WHERE checkout_request_id = ?`,
        ["success", amount, CheckoutRequestID]
      );

      console.log("✅ Payment marked successful:", CheckoutRequestID);
    } else {
      await db.run(
        `UPDATE payments
         SET status = ?
         WHERE checkout_request_id = ?`,
        ["failed", result.CheckoutRequestID]
      );

      console.log("❌ Payment failed:", result.CheckoutRequestID);
    }

    res.json({ message: "Callback received successfully" });
  } catch (error) {
    console.error("Callback error:", error.message);
    res.status(500).json({ error: "Callback processing failed" });
  }
});

// 🟢 Payment status endpoint
router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await db.get(
      `SELECT status FROM payments
       WHERE order_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [orderId]
    );

    res.json(payment?.status || "pending");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
