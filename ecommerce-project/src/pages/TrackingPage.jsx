import { Header } from "../components/Header";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import dayjs from "dayjs";
import './TrackingPage.css'


export function TrackingPage({cart}){
  const {orderId, productId} = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    async function fetchTrackingPageData(){
      const response = await axios.get(`/api/orders/${orderId}?expand=products`)
      setOrder(response.data)
    }
    fetchTrackingPageData();
  }, [orderId])
 
  if(!order){return null;}

  const selectedProduct = order.products.find((product) => {
    return productId === product.productId
  })
   
  const totalDeliveryTimeMS = selectedProduct.estimatedDeliveryTimeMs - order.orderTimeMs
  const timePassedMs = dayjs().valueOf() - order.orderTimeMs

  let deliveryPercent = (timePassedMs/ totalDeliveryTimeMS) * 100
  let isPreparing = deliveryPercent < 33;
  let isShipped = deliveryPercent >= 33 && deliveryPercent < 100;
  let isDelivered = deliveryPercent === 100;

  if (deliveryPercent > 100){deliveryPercent = 100}
  return (
    <>
      <title>Tracking</title>

      <Header cart={cart} />

      <div className="tracking-page">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to="/orders">
            View all orders
          </Link>

          <div className="delivery-date">
            {deliveryPercent >= 100 ? "Delivered on" : "Arrived on"}
            {dayjs(selectedProduct.estimatedDeliveryTimeMs).format(
              " dddd MMMM, D"
            )}
          </div>

          <div className="product-info">{selectedProduct.name}</div>

          <div className="product-info">
            Quantity: {selectedProduct.quantity}
          </div>

          <img className="product-image" src={selectedProduct.product.image} />

          <div className="progress-labels-container">
            <div
              className={`progress-label ${isPreparing && "current-status"}`}
            >
              Preparing
            </div>
            <div className={`progress-label ${isShipped && "current-status"}`}>
              Shipped
            </div>
            <div
              className={`progress-label ${isDelivered && "current-status"}`}
            >
              Delivered
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${deliveryPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}