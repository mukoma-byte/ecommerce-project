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

    // ✅ Validate required fields
    if (!phone || !amount || !orderId || !userId) {
      return res.status(400).json({
        error: "Missing required fields: phone, amount, orderId, userId",
      });
    }

    // ✅ Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0",
      });
    }

    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    console.log("STK push payload:", {
      Amount: parseInt(amount, 10),
      PhoneNumber: phone,
      OrderId: orderId,
    });

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: parseInt(amount, 10),
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

    // ✅ Return consistent response with both orderId and checkoutRequestID
    res.json({
      message: "STK push initiated. Please complete the payment on your phone.",
      orderId: orderId, // ✅ For navigation
      checkoutRequestID: checkoutRequestID, // ✅ For reference
    });
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.error || "STK Push failed. Please try again.",
    });
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
      // ✅ Payment successful
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
      // ✅ Payment failed
      await db.run(
        `UPDATE payments
         SET status = ?
         WHERE checkout_request_id = ?`,
        ["failed", result.CheckoutRequestID]
      );

      console.log("❌ Payment failed:", result.CheckoutRequestID);
    }

    // ✅ Always respond with success to acknowledge callback
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

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const payment = await db.get(
      `SELECT status FROM payments
       WHERE order_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [orderId]
    );

    // ✅ Return consistent response format
    if (!payment) {
      return res.status(404).json({
        error: "Payment not found for this order",
        status: "pending", // Default to pending if not found
      });
    }

    res.json({
      status: payment.status,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Status check error:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// 🟢 Payment history for an order (optional, for debugging)
router.get("/history/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await db.all(
      `SELECT id, user_id, amount, status, checkout_request_id, createdAt
       FROM payments
       WHERE order_id = ?
       ORDER BY id DESC`,
      [orderId]
    );

    res.json(payments || []);
  } catch (error) {
    console.error("Payment history error:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
