import { useState } from "react";
import "./PaymentModal.css";

export function PaymentModal({ isOpen, onClose, onSubmit, isProcessing }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate phone number (Kenyan format)
    const phoneRegex = /^(254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      setError(
        "Please enter a valid phone number (e.g., 0712345678 or 254712345678)"
      );
      return;
    }

    setError("");
    // Format to 254 format
    let formattedPhone = phoneNumber.replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    }

    onSubmit(formattedPhone);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPhoneNumber("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>M-Pesa Payment</h2>
          {!isProcessing && (
            <button className="modal-close" onClick={handleClose}>
              &times;
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="payment-instruction">
              Enter your M-Pesa phone number to receive a payment prompt
            </p>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678 or 254712345678"
                disabled={isProcessing}
                required
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            {isProcessing && (
              <div className="processing-message">
                <div className="spinner"></div>
                <p>
                  Processing payment... Please check your phone for the M-Pesa
                  prompt
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="button-secondary"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
