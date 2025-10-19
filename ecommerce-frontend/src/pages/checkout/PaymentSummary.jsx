import { formatMoney } from "../../utils/money";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./PaymentSummary.css";

export function PaymentSummary({ paymentSummary, loadCart }) {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    try {
      setError("");
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        setError("You must be logged in to place an order.");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      // ✅ Validate phone format
      let formattedPhone = phone.trim();
      if (!formattedPhone) {
        setError("Please enter your M-Pesa phone number.");
        return;
      }

      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1); // e.g., 07 → 2547
      } else if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.substring(1);
      }

      if (!/^2547\d{8}$/.test(formattedPhone)) {
        setError(
          "Enter a valid phone number in the format 07XXXXXXXX or 2547XXXXXXXX."
        );
        return;
      }

      setIsPaying(true);

      // ✅ STEP 1: CREATE ORDER FIRST (this clears the cart automatically)
      console.log("Creating order...");
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderRes.json();
      const orderId = orderData.id;
      console.log("Order created successfully:", orderId);

      // ✅ STEP 2: NOW initiate M-Pesa payment with the orderId
      console.log("Initiating M-Pesa payment...");
      const res = await fetch("/api/pay/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: Math.round(paymentSummary.totalCostCents / 100),
          orderId: orderId, // ✅ Send the orderId
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Clear cart from UI
        if (loadCart) {
          await loadCart();
        }
        setIsPaying(false);
        alert(data.message || "Please confirm the payment on your phone.");
        // ✅ Navigate using the orderId from the order creation
        navigate(`/payment-processing/${orderId}`);
      } else {
        setIsPaying(false);
        setError(data.error || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      setIsPaying(false);
      console.error("Order/Payment Error:", err);
      setError(err.message || "Failed to process order. Please try again.");
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
          disabled={isPaying}
        />
        <p className="phone-hint">Enter your M-Pesa registered number</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <p className="error-message">{error}</p>}

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
