import { formatMoney } from "../../utils/money";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PaymentSummary({ paymentSummary, loadCart, user, token }) {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      setIsPaying(true);

      // 1️⃣ Create the order first
      const orderRes = await axios.post(
        "/api/orders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = orderRes.data; // assuming backend returns the new order
      const totalPrice = paymentSummary.totalCostCents / 100; // convert from cents to KES

      // 2️⃣ Trigger STK Push
      const payRes = await fetch("/api/pay/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: user.phone,
          amount: totalPrice,
          orderId: order.id,
          userId: user.id,
        }),
      });

      const data = await payRes.json();
      alert(
        data.message || "STK Push initiated. Please confirm on your phone."
      );

      // 3️⃣ Poll backend for payment status
      const interval = setInterval(async () => {
        try {
          const verify = await fetch(`/api/pay/status/${order.id}`);
          const status = await verify.json();

          if (status === "success") {
            clearInterval(interval);
            await loadCart(); // refresh cart after payment
            navigate("/orders");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 4000);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment initiation failed. Please try again.");
    } finally {
      setIsPaying(false);
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
