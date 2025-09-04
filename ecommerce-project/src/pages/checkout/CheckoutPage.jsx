import axios from "axios";
import { useState, useEffect } from "react";
import { CheckoutHeader } from "./CheckoutHeader";
import { PaymentSummary } from "./PaymentSummary";
import { OrderSummary } from "./OrderSummary";
import "./CheckoutPage.css";

export function CheckoutPage({ cart, loadCart }) {
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
  }, [cart]);
  /*Here we used cart as the dependancy, so that when ever it changes... payment summary is updated,,,, in the case where we update a delivery option of a product(different delivery options have different price ranges) ---- but we are also reloading the delivery options which is not necessary,,,because we update the delivery option in the cart.....then reload the cart, so we will separate the code which renders the payment summary into it's own useEffect*/
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="images/cart-favicon.png" />
      <title>Checkout</title>

      <CheckoutHeader cart={cart} />

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary
            deliveryOptions={deliveryOptions}
            cart={cart}
            loadCart={loadCart}
          />
          {paymentSummary && (
            <>
              <PaymentSummary
                paymentSummary={paymentSummary}
                loadCart={loadCart}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
