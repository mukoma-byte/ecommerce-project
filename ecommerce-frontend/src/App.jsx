import { Routes, Route } from "react-router";
import { HomePage } from "./pages/home/HomePage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { TrackingPage } from "./pages/TrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { LoginPage } from "./pages/auth/LoginPage";
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
function App() {
  const [cart, setCart] = useState([]);

  const { user, setUser, loadingUser } = useAuth();

  window.axios = axios;

  const loadCart = async () => {
    const response = await axios.get("/api/cart-items?expand=product", {
      withCredentials: true,
    });
    setCart(response.data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <Routes>
      <Route
        index
        element={<HomePage cart={cart} loadCart={loadCart} setCart={setCart} />}
      />
      <Route path="register" element={<SignupPage />} />
      <Route
        path="login"
        element={
          <LoginPage
            user={user}
            loadingUser={loadingUser}
            setUser={setUser}
            loadCart={loadCart}
          />
        }
      />
      <Route
        path="checkout"
        element={<CheckoutPage cart={cart} loadCart={loadCart} user={user} />}
      />
      <Route
        path="orders"
        element={
          <OrdersPage
            cart={cart}
            loadCart={loadCart}
            user={user}
            setCart={setCart}
            setUser={setUser}
          />
        }
      />
      <Route
        path="tracking/:orderId/:productId"
        element={
          <TrackingPage
            cart={cart}
            user={user}
            setCart={setCart}
            setUser={setUser}
          />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
