<<<<<<< HEAD
import { Routes, Route } from "react-router";
=======
import { Routes, Route } from "react-router-dom";
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import { HomePage } from "./pages/home/HomePage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { TrackingPage } from "./pages/TrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
<<<<<<< HEAD
=======
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Profile from "./pages/profile/ProfilePage.jsx";

>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

<<<<<<< HEAD
function App() {
  const [cart, setCart] = useState([]);

  window.axios = axios

   const loadCart = async () => {
     const response = await axios.get("/api/cart-items?expand=product");
     setCart(response.data);
   };

  useEffect(() => {
   
    loadCart();
   
  }, []);

  return (
    <Routes>
      <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
      <Route
        path="checkout"
        element={<CheckoutPage cart={cart} loadCart={loadCart} />}
      />
      <Route
        path="orders"
        element={<OrdersPage cart={cart} loadCart={loadCart} />}
      />
      <Route
        path="tracking/:orderId/:productId"
        element={<TrackingPage cart={cart} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
=======
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
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
  );
}

export default App;
