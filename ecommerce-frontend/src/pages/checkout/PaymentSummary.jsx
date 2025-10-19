import { formatMoney } from "../../utils/money";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PaymentSummary({ paymentSummary, }) {
  const navigate = useNavigate();
  const [isPaying] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        alert("You must be logged in to place an order.");
        navigate("/login");
        return;
      }

      const res = await fetch("/api/pay/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: user.phone, // user’s M-Pesa number
          amount: paymentSummary.totalCostCents / 100,
          userId: user.id,
        }),
      });

      const data = await res.json();

      alert(data.message || "Please confirm the payment on your phone.");

      navigate(`/payment-processing/${data.orderId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start payment. Try again.");
    }
  };


  return (
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
        disabled={isPaying}
      >
        {isPaying ? "Processing..." : "Place your order"}
      </button>
    </div>
  );
}
