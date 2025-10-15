import axios from "axios";
import { useEffect, useState, Fragment } from "react";
<<<<<<< HEAD
import {OrdersGrid} from "./OrdersGrid"
import { Header } from "../../components/Header";
import { Link } from "react-router";
=======
import { OrdersGrid } from "./OrdersGrid";
import { Header } from "../../components/Header";
import { Link } from "react-router-dom";
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import BuyAgainIcon from "../../assets/images/icons/buy-again.png";

import "./OrdersPage.css";

<<<<<<< HEAD
export function OrdersPage({ cart, loadCart}) {
=======
export function OrdersPage({ cart, loadCart }) {
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
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
