import axios from "axios";
import { useState, useEffect } from "react";
import { CheckoutHeader } from "./CheckoutHeader";
import { PaymentSummary } from "./PaymentSummary";
import { OrderSummary } from "./OrderSummary";
import "./CheckoutPage.css";

export function CheckoutPage({ cart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  
  useEffect(() => {
    async function fetchCheckoutData() {
      let response = await axios.get(
        "/api/delivery-options?expand=estimatedDeliveryTime"
      );
      setDeliveryOptions(response.data);

      response = await axios.get("/api/payment-summary");
      setPaymentSummary(response.data);
    }

    fetchCheckoutData();
  }, []);
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="images/cart-favicon.png" />
      <title>Checkout</title>

      <CheckoutHeader cart={cart}/>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary deliveryOptions={deliveryOptions} cart={cart} />
          {paymentSummary && (
            <>
              <PaymentSummary paymentSummary={paymentSummary} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
