import { useState, useRef } from "react";
import axios from "axios";
import "./MpesaPaymentModal.css";

export default function MpesaPaymentModal({ totalCost, onClose, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const intervalRef = useRef(null);
  const amount = Math.round(totalCost);
  console.log(amount);

  // Phone number validation and formatting for M-Pesa (Kenya)
  const validateAndFormatPhone = (phoneNumber) => {
    // Kenyan phone number patterns
    const kenyaPhonePatterns = [
      /^0[17]\d{8}$/, // 0712345678 or 0112345678
      /^\+?254[17]\d{8}$/, // +254712345678 or 254712345678
      /^0\s?[17]\d{2}\s?\d{3}\s?\d{3}$/, // 0712 345 678
      /^\+?254\s?[17]\d{2}\s?\d{3}\s?\d{3}$/, // +254 712 345 678
    ];

    // Remove all spaces and dashes for easier processing
    const cleanPhone = phoneNumber.replace(/[\s-]/g, "");

    // Check if it matches any Kenyan pattern
    const isKenyanPhone = kenyaPhonePatterns.some((pattern) =>
      pattern.test(cleanPhone)
    );

    if (!isKenyanPhone) {
      return {
        isValid: false,
        error: "Invalid phone number. Use format: 0712345678 or +254712345678",
      };
    }

    let formattedNumber = cleanPhone;

    // Convert 0712345678 to 254712345678
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "254" + formattedNumber.substring(1);
    }

    // Remove + from +254712345678 to get 254712345678
    if (formattedNumber.startsWith("+254")) {
      formattedNumber = formattedNumber.substring(1);
    }

    // Validate it's exactly 12 digits (254 + 9 digits)
    if (formattedNumber.length === 12 && formattedNumber.startsWith("254")) {
      return {
        isValid: true,
        formattedNumber: formattedNumber,
      };
    }

    return {
      isValid: false,
      error: "Invalid phone number format",
    };
  };

  // Handle phone input change with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }

    // Only validate if user has entered something
    if (value.trim()) {
      const validation = validateAndFormatPhone(value);
      if (!validation.isValid) {
        setPhoneError(validation.error);
      }
    }
  };

  const initiatePayment = async () => {
    if (!phone) {
      setPhoneError("Please enter your M-Pesa phone number");
      return;
    }

    // Validate and format phone number
    const validation = validateAndFormatPhone(phone);

    if (!validation.isValid) {
      setPhoneError(validation.error);
      return;
    }

    try {
      setLoading(true);
      setMessage("Sending STK push...");
      setPhoneError("");

      const { data } = await axios.post("/api/mpesa/stkpush", {
        phone: validation.formattedNumber, // Send formatted phone number
        amount: amount,
      });

      const checkoutId = data.CheckoutRequestID;
      setMessage("Please check your phone for the M-Pesa prompt...");

      // Poll payment status every 5 seconds
      intervalRef.current = setInterval(async () => {
        try {
          const res = await axios.get(`/api/mpesa/status/${checkoutId}`);
          if (res.data.status === "success") {
            clearInterval(intervalRef.current);
            setMessage("Payment successful! ✓");
            setLoading(false);
            setTimeout(() => {
              onSuccess(); // call parent handler
              onClose(); // close modal
            }, 1500);
          } else if (res.data.status === "failed") {
            clearInterval(intervalRef.current);
            setMessage("Payment failed. Please try again.");
            setLoading(false);
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 5000);

      // Clear interval after 2 minutes (timeout)
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setMessage("Payment timed out. Please try again.");
          setLoading(false);
        }
      }, 120000);
    } catch (error) {
      console.error("M-Pesa payment error:", error);
      setMessage(
        error.response?.data?.message ||
          "Something went wrong initiating payment. Please try again."
      );
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      initiatePayment();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">M-Pesa Payment</h2>

        <p className="amount-display">Total Amount: KES {amount}</p>

        <div className="input-wrapper">
          <input
            type="tel"
            className={`phone-input ${phoneError ? "input-error" : ""}`}
            placeholder="e.g., 0712345678 or +254712345678"
            value={phone}
            onChange={handlePhoneChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          {phoneError && <p className="error-text">{phoneError}</p>}
          <p className="input-hint">Enter your Safaricom M-Pesa number</p>
        </div>

        <button
          className="pay-button"
          onClick={initiatePayment}
          disabled={loading || !phone}
        >
          {loading ? "Processing..." : `Pay KES ${amount}`}
        </button>

        {message && (
          <p
            className={`message-text ${
              message.includes("successful") ? "success-message" : ""
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="cancel-button"
          onClick={() => {
            clearInterval(intervalRef.current);
            onClose();
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
