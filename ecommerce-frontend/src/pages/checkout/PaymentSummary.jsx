import { formatMoney } from "../../utils/money";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./PaymentSummary.css";

export function PaymentSummary({ paymentSummary, }) {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [phone, setPhone] = useState("");

  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        alert("You must be logged in to place an order.");
        navigate("/login");
        return;
      }

      // ✅ Validate phone format
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1); // e.g., 07 → 2547
      } else if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.substring(1);
      }

      if (!/^2547\d{8}$/.test(formattedPhone)) {
        alert(
          "Enter a valid phone number in the format 07XXXXXXXX or 2547XXXXXXXX."
        );
        return;
      }

      setIsPaying(true);

      const res = await fetch("/api/pay/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formattedPhone, // user’s M-Pesa number
          amount: Math.round(paymentSummary.totalCostCents / 100),
          userId: user.id,
        }),
      });

      const data = await res.json();
      setIsPaying(false);

      if (res.ok) {
        alert(data.message || "Please confirm the payment on your phone.");
        navigate(`/payment-processing/${data.orderId}`);
      } else {
        alert(data.error || "Failed to initiate payment.");
      };
    } catch (err) {
      setIsPaying(false);
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

      {/* PHONE NUMBER INPUT */}
      <div className="phone-input-container">
        <label htmlFor="phone" className="phone-label">
          M-Pesa Phone Number:
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0712345678"
          className="phone-input"
        />
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
