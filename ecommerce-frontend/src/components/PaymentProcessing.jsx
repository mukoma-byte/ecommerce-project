import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./PaymentProcessing.css"; // import the CSS file

export function PaymentProcessing() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const verify = await axios.get(`/api/pay/status/${orderId}`);
        const { status } = verify.data;

        if (status === "success") {
          clearInterval(interval);
          setStatus("success");
          setTimeout(() => navigate("/orders"), 1500);
        } else if (status === "failed") {
          clearInterval(interval);
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, navigate]);

  return (
    <div className="payment-processing">
      {status === "pending" ? (
        <>
          <div className="loader"></div>
          <p className="waiting-text">Waiting for payment confirmation...</p>
          <p className="instructions">
            Please check your phone and complete the M-Pesa payment.
          </p>
        </>
      ) : status === "failed" ? (
        <p className="failed-text">Payment failed. Please try again.</p>
      ) : status === "success" ? (
        <p className="success-text">
          Payment successful! Redirecting to your orders...
        </p>
      ) : null}
    </div>
  );
}
