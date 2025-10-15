import dayjs from "dayjs";
import axios from "axios";
import { formatMoney } from "../../utils/money";
<<<<<<< HEAD
import BuyAgainIcon from "../../assets/images/icons/buy-again.png"
import { Fragment } from "react";
import { Link } from "react-router";
=======
import BuyAgainIcon from "../../assets/images/icons/buy-again.png";
import { Fragment } from "react";
import { Link } from "react-router-dom";
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
export function OrdersGrid({ orders, loadCart }) {
  return (
    <div className="orders-grid">
      {orders.map((order) => {
<<<<<<< HEAD
      
=======
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
        return (
          <div key={order.id} className="order-container">
            <div className="order-header">
              <div className="order-header-left-section">
                <div className="order-date">
                  <div className="order-header-label">Order Placed:</div>
                  <div>{dayjs(order.orderTimeMs).format("dddd D")}</div>
                </div>
                <div className="order-total">
                  <div className="order-header-label">Total:</div>
                  <div>{formatMoney(order.totalCostCents)}</div>
                </div>
              </div>

              <div className="order-header-right-section">
                <div className="order-header-label">Order ID:</div>
                <div>{order.id}</div>
              </div>
            </div>
            <div className="order-details-grid">
              {order.products.map((orderProduct) => {
<<<<<<< HEAD
                  const addToCart = async() => {
                    await axios.post("/api/cart-items", {
                      productId: orderProduct.productId,
                      quantity: orderProduct.quantity
                    });

                    await loadCart();
                  }; 
=======
                const addToCart = async () => {
                  await axios.post("/api/cart-items", {
                    productId: orderProduct.productId,
                    quantity: orderProduct.quantity,
                  });

                  await loadCart();
                };
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
                return (
                  <Fragment key={orderProduct.productId}>
                    <div className="product-image-container">
                      <img src={orderProduct.product.image} alt="product" />
                    </div>

                    <div className="product-details">
                      <div className="product-name">{orderProduct.name}</div>
                      <div className="product-delivery-date">
                        Arriving on:
                        {dayjs(orderProduct.estimatedDeliveryTimeMs).format(
                          "dddd D"
                        )}
                      </div>
                      <div className="product-quantity">
                        Quantity: {orderProduct.quantity}
                      </div>
                      <button className="buy-again-button button-primary">
                        <img className="buy-again-icon" src={BuyAgainIcon} />
<<<<<<< HEAD
                        <span className="buy-again-message" onClick={addToCart}>Add to Cart</span>
=======
                        <span className="buy-again-message" onClick={addToCart}>
                          Add to Cart
                        </span>
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
                      </button>
                    </div>

                    <div className="product-actions">
                      <Link
                        to={`/tracking/${order.id}/${orderProduct.product.id}`}
                      >
                        <button className="track-package-button button-secondary">
                          Track package
                        </button>
                      </Link>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
