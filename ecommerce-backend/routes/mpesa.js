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
// 🔍 Test if database is working
router.get("/test-db", async (req, res) => {
  try {
    const payments = await db.all(
      `SELECT * FROM payments ORDER BY id DESC LIMIT 5`
    );
    const orders = await db.all(
      `SELECT * FROM orders ORDER BY id DESC LIMIT 5`
    );
    
    res.json({ 
      message: "Database connected ✅",
      recentPayments: payments,
      recentOrders: orders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Database error ❌",
      message: error.message 
    });
  }
});

// 🔍 STK Push with enhanced logging
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, orderId, userId } = req.body;

    console.log("\n" + "=".repeat(50));
    console.log("📞 STK PUSH REQUEST");
    console.log("=".repeat(50));
    console.log("Request data:", { phone, amount, orderId, userId });

    if (!phone || !amount || !orderId || !userId) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        error: "Missing required fields: phone, amount, orderId, userId",
      });
    }

    if (amount <= 0) {
      console.log("❌ Invalid amount");
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    console.log("✅ Validation passed");
    console.log("Getting M-Pesa access token...");

    const token = await getAccessToken();
    console.log("✅ Access token received");

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    console.log("🔐 Encryption details:", {
      timestamp,
      hasPassword: !!password,
    });

    const payload = {
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
    };

    console.log("📤 Sending to M-Pesa:", {
      ...payload,
      Password: "***hidden***",
    });

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutRequestID = response.data.CheckoutRequestID;
    console.log("✅ M-Pesa responded:", {
      CheckoutRequestID: checkoutRequestID,
      ResponseCode: response.data.ResponseCode,
      ResponseDescription: response.data.ResponseDescription,
    });

    console.log("💾 Saving payment to database...");

    await db.run(
      `INSERT INTO payments (user_id, order_id, amount, status, checkout_request_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, orderId, amount, "pending", checkoutRequestID]
    );

    console.log("✅ Payment saved as PENDING in database");
    console.log("=".repeat(50) + "\n");

    res.json({
      message: "STK push initiated. Please complete the payment on your phone.",
      orderId: orderId,
      checkoutRequestID: checkoutRequestID,
    });
  } catch (err) {
    console.error("\n❌ STK PUSH ERROR:");
    console.error("Error:", err.response?.data || err.message);
    console.log("=".repeat(50) + "\n");

    res.status(500).json({
      error: err.response?.data?.error || "STK Push failed. Please try again.",
    });
  }
});

// 🟢 STK Push initiation
router.post("/callback", async (req, res) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("📩 M-PESA CALLBACK RECEIVED");
    console.log("=".repeat(50));
    console.log("Full request body:", JSON.stringify(req.body, null, 2));

    const result = req.body.Body.stkCallback;
    console.log("\nCallback Result:", {
      ResultCode: result.ResultCode,
      ResultDesc: result.ResultDesc,
      CheckoutRequestID: result.CheckoutRequestID,
      MerchantRequestID: result.MerchantRequestID,
    });

    if (result.ResultCode === 0) {
      // ✅ Payment successful
      console.log("\n✅ PAYMENT SUCCESSFUL");

      const { CheckoutRequestID, CallbackMetadata } = result;
      const amount = CallbackMetadata.Item.find(
        (i) => i.Name === "Amount"
      )?.Value;

      console.log("Updating payment with:", {
        checkoutRequestId: CheckoutRequestID,
        amount: amount,
        newStatus: "success",
      });

      const updateResult = await db.run(
        `UPDATE payments
         SET status = ?, amount = ?
         WHERE checkout_request_id = ?`,
        ["success", amount, CheckoutRequestID]
      );

      console.log("✅ Payment marked as SUCCESS in database");
      console.log("Update result:", updateResult);

      // Verify update
      const verifyPayment = await db.get(
        `SELECT * FROM payments WHERE checkout_request_id = ?`,
        [CheckoutRequestID]
      );
      console.log("✅ Verification - Updated payment:", verifyPayment);
    } else {
      // ❌ Payment failed
      console.log("\n❌ PAYMENT FAILED");
      console.log("Result Code:", result.ResultCode);
      console.log("Result Description:", result.ResultDesc);

      const updateResult = await db.run(
        `UPDATE payments
         SET status = ?
         WHERE checkout_request_id = ?`,
        ["failed", result.CheckoutRequestID]
      );

      console.log("❌ Payment marked as FAILED in database");
      console.log("Update result:", updateResult);
    }

    console.log("=".repeat(50) + "\n");
    res.json({ message: "Callback received successfully" });
  } catch (error) {
    console.error("\n❌ CALLBACK ERROR:");
    console.error(error);
    console.log("=".repeat(50) + "\n");
    res.status(500).json({ error: "Callback processing failed" });
  }
});



// 🟢 Payment status endpoint
router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔍 Checking payment status for orderId: ${orderId}`);

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const payment = await db.get(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1`,
      [orderId]
    );

    if (!payment) {
      console.log(`❌ No payment found for orderId: ${orderId}`);
      return res.status(404).json({
        error: `No payment found for orderId: ${orderId}`,
        status: "pending",
        orderId: orderId,
      });
    }

    console.log(`✅ Payment found:`, {
      orderId: orderId,
      status: payment.status,
      checkoutRequestId: payment.checkout_request_id,
    });

    res.json({
      status: payment.status,
      orderId: orderId,
      checkoutRequestId: payment.checkout_request_id,
      amount: payment.amount,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    console.error("❌ Status check error:", error.message);
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

router.post("/complete-payment/:checkoutRequestId", async (req, res) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("🧪 MANUAL PAYMENT COMPLETION");
    console.log("=".repeat(50));

    const { checkoutRequestId } = req.params;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: "checkoutRequestId required" });
    }

    console.log("Finding payment for:", checkoutRequestId);

    // Find the payment
    const payment = await db.get(
      `SELECT * FROM payments WHERE checkout_request_id = ?`,
      [checkoutRequestId]
    );

    if (!payment) {
      console.log("❌ Payment not found:", checkoutRequestId);
      return res.status(404).json({ error: "Payment not found" });
    }

    console.log("✅ Payment found:", payment);

    // Update to success
    await db.run(
      `UPDATE payments SET status = ? WHERE checkout_request_id = ?`,
      ["success", checkoutRequestId]
    );

    console.log("✅ Payment marked as SUCCESS");
    console.log("=".repeat(50) + "\n");

    res.json({
      message: "Payment completed successfully",
      orderId: payment.order_id,
      status: "success",
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
export default router;
