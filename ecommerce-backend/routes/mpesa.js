// mpesaRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

// Store payment status in memory (use a database in production)
const paymentStatus = new Map();

// Daraja API Credentials (Get from https://developer.safaricom.co.ke/)
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE; // e.g., "174379" for sandbox
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL; // Your callback URL

// Generate access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64"
  );

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

// Generate password for STK Push
const generatePassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
  const password = Buffer.from(
    `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`
  ).toString("base64");
  return { password, timestamp };
};

// POST /api/payments/mpesa - Initiate STK Push
router.post("/mpesa", async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res
      .status(400)
      .json({ message: "Phone number and amount are required" });
  }

  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const stkPushData = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure it's an integer
      PartyA: phoneNumber,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: `Order-${Date.now()}`,
      TransactionDesc: "Payment for order",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Initialize payment status as pending
    const checkoutRequestId = response.data.CheckoutRequestID;
    paymentStatus.set(checkoutRequestId, { status: "pending" });

    res.json(response.data);
  } catch (error) {
    console.error("STK Push error:", error.response?.data || error);
    res.status(500).json({
      message:
        error.response?.data?.errorMessage || "Failed to initiate payment",
    });
  }
});

// GET /api/payments/mpesa/status/:checkoutRequestId - Check payment status
router.get("/mpesa/status/:checkoutRequestId", async (req, res) => {
  const { checkoutRequestId } = req.params;

  const status = paymentStatus.get(checkoutRequestId);

  if (!status) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json(status);
});

// POST /api/payments/mpesa/callback - M-Pesa callback
router.post("/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback received:", JSON.stringify(req.body, null, 2));

  const callbackData = req.body.Body?.stkCallback;

  if (!callbackData) {
    return res.status(400).json({ message: "Invalid callback data" });
  }

  const checkoutRequestId = callbackData.CheckoutRequestID;
  const resultCode = callbackData.ResultCode;

  if (resultCode === 0) {
    // Payment successful
    paymentStatus.set(checkoutRequestId, {
      status: "completed",
      data: callbackData,
      message: "Payment completed successfully",
    });
  } else {
    // Payment failed
    paymentStatus.set(checkoutRequestId, {
      status: "failed",
      message: callbackData.ResultDesc || "Payment failed",
    });
  }

  // Acknowledge receipt of callback
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

export default router;
