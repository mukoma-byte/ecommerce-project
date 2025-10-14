import axios from "axios";
import { useEffect, useState, Fragment } from "react";
import { OrdersGrid } from "./OrdersGrid";
import { Header } from "../../components/Header";
import { Link } from "react-router-dom";
import BuyAgainIcon from "../../assets/images/icons/buy-again.png";

import "./OrdersPage.css";

export function OrdersPage({ cart, loadCart }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    async function fetchOrderData() {
      const response = await axios.get("/api/orders?expand=products");
      setOrders(response.data);
    }
    fetchOrderData();
  }, []);
  return (
    <>
      <a rel="icon" type="image/svg+xml" href="images/orders-favicon.png" />
      <title>Orders</title>

      <Header cart={cart} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>
        <OrdersGrid orders={orders} loadCart={loadCart} />
      </div>
    </>
  );
}
