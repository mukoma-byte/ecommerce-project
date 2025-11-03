import { formatMoney } from "../../utils/money";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function PaymentSummary({ paymentSummary, loadCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const createOrder = async () => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await axios.post("/api/orders");
      await loadCart();
      navigate("/orders");
    } catch (error) {
      console.error("Failed to create order:", error);
      // Optionally show an error message to the user
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
        onClick={createOrder}
      >
        Place your order
      </button>
    </div>
  );
}
