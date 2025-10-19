import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./PaymentProcessing.css";

export function PaymentProcessing() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const MAX_ATTEMPTS = 75; // 75 polls × 4 sec = 5 minutes
  const POLL_INTERVAL = 4000; // 4 seconds
  const TIMEOUT_SECONDS = 300; // 5 minutes in seconds

  useEffect(() => {
    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      setStatus("timeout");
      setError(
        `Payment confirmation timeout after ${Math.floor(
          TIMEOUT_SECONDS / 60
        )} minutes. Please contact support if payment was deducted.`
      );
      return;
    }

    const interval = setInterval(async () => {
      setAttempts((prev) => prev + 1);
      setTimeElapsed((prev) => prev + 4);

      try {
        const verify = await axios.get(`/api/pay/status/${orderId}`, {
          timeout: 5000, // 5 second timeout per request
        });

        const { status: paymentStatus } = verify.data;

        if (paymentStatus === "success") {
          clearInterval(interval);
          setStatus("success");
          // Redirect after showing success message
          setTimeout(() => navigate("/orders"), 1500);
        } else if (paymentStatus === "failed") {
          clearInterval(interval);
          setStatus("failed");
          setError(
            "Payment was declined. Please try again or use a different payment method."
          );
        }
      } catch (error) {
        console.error("Error checking payment status:", error);

        // Distinguish between different error types
        if (error.code === "ECONNABORTED") {
          setError("Request timeout. Retrying...");
        } else if (error.response?.status === 404) {
          setError("Order not found. Please verify your order ID.");
          setStatus("error");
        } else if (error.response?.status === 500) {
          setError("Server error. Retrying...");
        } else if (!error.response) {
          setError("Network error. Retrying...");
        } else {
          setError("Failed to check payment status. Retrying...");
        }
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [attempts, orderId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRetry = () => {
    setStatus("pending");
    setError(null);
    setAttempts(0);
    setTimeElapsed(0);
  };

  return (
    <div className="payment-processing">
      {status === "pending" ? (
        <>
          <div className="loader"></div>
          <p className="waiting-text">Waiting for payment confirmation...</p>
          <p className="instructions">
            📱 Please check your phone and complete the M-Pesa payment.
          </p>
          {error && <p className="warning-text">⚠️ {error}</p>}
          <div className="payment-info">
            <p className="attempt-counter">
              Attempt: {attempts} of {MAX_ATTEMPTS}
            </p>
            <p className="time-elapsed">
              Time elapsed: {formatTime(timeElapsed)}
            </p>
          </div>
        </>
      ) : status === "failed" ? (
        <div className="payment-result failed">
          <p className="failed-text">❌ Payment Failed</p>
          <p className="error-details">{error}</p>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Return to Checkout
            </button>
            <button className="btn btn-secondary" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      ) : status === "timeout" ? (
        <div className="payment-result timeout">
          <p className="timeout-text">⏱️ Payment Confirmation Timeout</p>
          <p className="error-details">{error}</p>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/orders")}
            >
              Check Orders
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/checkout")}
            >
              Return to Checkout
            </button>
          </div>
        </div>
      ) : status === "error" ? (
        <div className="payment-result error">
          <p className="error-text">⚠️ An Error Occurred</p>
          <p className="error-details">{error}</p>
          <div className="button-group">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Go Home
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/checkout")}
            >
              Return to Checkout
            </button>
          </div>
        </div>
      ) : status === "success" ? (
        <div className="payment-result success">
          <p className="success-text">✅ Payment Successful!</p>
          <p className="success-message">Redirecting to your orders...</p>
        </div>
      ) : null}
    </div>
  );
}
