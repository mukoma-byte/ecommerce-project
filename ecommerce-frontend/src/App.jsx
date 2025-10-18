import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { TrackingPage } from "./pages/TrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Profile from "./pages/profile/ProfilePage.jsx";

import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

import FloatingChatbot from "./components/FloatingChatbot.jsx";

function App() {
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    const response = await axios.get("/api/cart-items?expand=product");
    setCart(response.data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <>
      <Routes>
        <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
        <Route path="checkout" element={<CheckoutPage cart={cart} />} />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage cart={cart} />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="tracking/:orderId/:productId" element={<TrackingPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <FloatingChatbot />
    </>
  );
}

export default App;
