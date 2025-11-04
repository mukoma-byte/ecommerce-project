import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Temporary in-memory store for payment status
const paymentStatus = new Map();

// Get Safaricom access token
async function getAccessToken() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
}

// Initiate STK Push
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    console.log(phone, amount);
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
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
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "EcommerceShop",
        TransactionDesc: "Ecommerce Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { CheckoutRequestID } = response.data;

    // Mark payment as "pending"
    paymentStatus.set(CheckoutRequestID, "pending");

    res.json({
      success: true,
      CheckoutRequestID,
      message: "STK push initiated. Check your phone to complete payment.",
    });
  } catch (error) {
    console.error(
      "Error initiating STK Push:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Callback endpoint (called by Safaricom)
router.post("/callback", (req, res) => {
  const callbackData = req.body;

  const CheckoutRequestID = callbackData?.Body?.stkCallback?.CheckoutRequestID;
  const ResultCode = callbackData?.Body?.stkCallback?.ResultCode;

  if (ResultCode === 0) {
    paymentStatus.set(CheckoutRequestID, "success");
    console.log("✅ Payment successful:", callbackData);
  } else {
    paymentStatus.set(CheckoutRequestID, "failed");
    console.log("❌ Payment failed:", callbackData);
  }

  res.json({ ResultCode: 0, ResultDesc: "Callback received successfully" });
});

// Poll endpoint (frontend checks payment status)
router.get("/status/:CheckoutRequestID", (req, res) => {
  const status = paymentStatus.get(req.params.CheckoutRequestID);
  res.json({ status: status || "unknown" });
});

export default router;
