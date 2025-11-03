import { useState } from "react";
import { formatMoney } from "../../utils/money";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { PaymentModal } from "./PaymentModal";

export function PaymentSummary({ paymentSummary, loadCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePlaceOrder = () => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Open payment modal
    setIsModalOpen(true);
    setPaymentError("");
  };

  const handlePayment = async (phoneNumber) => {
    setIsProcessing(true);
    setPaymentError("");

    try {
      // Initiate M-Pesa payment
      const paymentResponse = await axios.post("/api/payments/mpesa", {
        phoneNumber,
        amount: paymentSummary.totalCostCents / 100, // Convert cents to shillings
      });

      // Poll for payment status
      const checkoutRequestId = paymentResponse.data.CheckoutRequestID;
      const paymentStatus = await pollPaymentStatus(checkoutRequestId);

      if (paymentStatus.success) {
        // Create order after successful payment
        await axios.post("/api/orders", {
          paymentDetails: paymentStatus.data,
        });

        await loadCart();
        setIsModalOpen(false);
        navigate("/orders");
      } else {
        setPaymentError(
          paymentStatus.message || "Payment failed. Please try again."
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(
        error.response?.data?.message || "Payment failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, maxAttempts = 30) => {
    // Poll every 2 seconds for up to 60 seconds
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const statusResponse = await axios.get(
          `/api/payments/mpesa/status/${checkoutRequestId}`
        );

        if (statusResponse.data.status === "completed") {
          return { success: true, data: statusResponse.data };
        } else if (statusResponse.data.status === "failed") {
          return {
            success: false,
            message:
              statusResponse.data.message || "Payment was cancelled or failed",
          };
        }
        // If status is 'pending', continue polling
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }

    return { success: false, message: "Payment timeout. Please try again." };
  };

  return (
    <>
      <div className="payment-summary" data-testid="payment-summary">
        <div className="payment-summary-title">Payment Summary</div>

        <div className="payment-summary-row" data-testid="total-items">
          <div>Items ({paymentSummary.totalItems}):</div>
          <div className="payment-summary-money">
            {formatMoney(paymentSummary.productCostCents)}
          </div>
        </div>

        <div className="payment-summary-row">
          <div>Shipping &amp; handling:</div>
          <div className="payment-summary-money">
            {formatMoney(paymentSummary.shippingCostCents)}
          </div>
        </div>

        <div className="payment-summary-row subtotal-row">
          <div>Total before tax:</div>
          <div className="payment-summary-money">
            {formatMoney(paymentSummary.totalCostBeforeTaxCents)}
          </div>
        </div>

        <div className="payment-summary-row">
          <div>Estimated tax (10%):</div>
          <div className="payment-summary-money">
            {formatMoney(paymentSummary.taxCents)}
          </div>
        </div>

        <div className="payment-summary-row total-row">
          <div>Order total:</div>
          <div className="payment-summary-money">
            {formatMoney(paymentSummary.totalCostCents)}
          </div>
        </div>

        <button
          className="place-order-button button-primary"
          data-testid="place-order-btn"
          onClick={handlePlaceOrder}
        >
          Place your order
        </button>

        {paymentError && (
          <div
            className="payment-error"
            style={{ color: "red", marginTop: "10px" }}
          >
            {paymentError}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePayment}
        isProcessing={isProcessing}
      />
    </>
  );
}
