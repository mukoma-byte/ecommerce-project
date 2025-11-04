import { useState, useRef } from "react";
import axios from "axios";
import "./MpesaPaymentModal.css";

export default function MpesaPaymentModal({ totalCost, onClose, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);

  const initiatePayment = async () => {
    if (!phone) {
      setMessage("Please enter your M-Pesa phone number");
      return;
    }

    try {
      setLoading(true);
      setMessage("Sending STK push...");

      const { data } = await axios.post("/api/mpesa/initiate", {
        phone,
        amount: totalCost,
      });

      const checkoutId = data.CheckoutRequestID;

      // Poll payment status every 5 seconds
      intervalRef.current = setInterval(async () => {
        const res = await axios.get(`/api/mpesa/status/${checkoutId}`);
        if (res.data.status === "success") {
          clearInterval(intervalRef.current);
          setMessage("Payment successful!");
          setLoading(false);
          onSuccess(); // call parent handler
          onClose(); // close modal
        } else if (res.data.status === "failed") {
          clearInterval(intervalRef.current);
          setMessage("Payment failed. Try again.");
          setLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error("M-Pesa payment error:", error);
      setMessage("Something went wrong initiating payment.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">M-Pesa Payment</h2>

        <input
          type="tel"
          className="phone-input"
          placeholder="Enter your M-Pesa number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          className="pay-button"
          onClick={initiatePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay KES ${totalCost}`}
        </button>

        {message && <p className="message-text">{message}</p>}

        <button
          className="cancel-button"
          onClick={() => {
            clearInterval(intervalRef.current);
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
