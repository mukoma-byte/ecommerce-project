// routes/mpesa.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Generate M-Pesa access token
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

// STK Push simulation
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    const token = await getAccessToken();

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(
          `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, 14)}`
        ).toString("base64"),
        Timestamp: new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14),
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

    // Store initial payment attempt
    // Save { orderId, userId, status: 'pending' } in SQLite

    res.json({
      message: "STK push initiated. Complete payment on your phone.",
      checkoutRequestID: response.data.CheckoutRequestID,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "STK Push failed" });
  }
});

// Callback from M-Pesa
router.post("/callback", async (req, res) => {
  const result = req.body.Body.stkCallback;

  if (result.ResultCode === 0) {
    const { CheckoutRequestID, CallbackMetadata } = result;
    const amount = CallbackMetadata.Item.find(i => i.Name === "Amount").Value;
    const phone = CallbackMetadata.Item.find(i => i.Name === "PhoneNumber").Value;

    // Update SQLite: mark payment as successful
  }

  res.json({ message: "Callback received successfully" });
});

export default router;
