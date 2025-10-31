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

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  window.axios = axios;

  const loadCart = async () => {
    const response = await axios.get("/api/cart-items?expand=product", {
      withCredentials: true,
    });
    setCart(response.data);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      setUser(res.data.user); // either user object or null
    } catch (err) {
      console.error("Error checking session:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  

  useEffect(() => {
    fetchUser();
    loadCart();
  }, []);

  return (
    <Routes>
      <Route
        index
        element={
          <HomePage
            user={user}
            loadingUser={loadingUser}
            cart={cart}
            loadCart={loadCart}
            setCart={setCart}
            setUser={setUser}
          />
        }
      />
      <Route
        path="register"
        element={
          <SignupPage user={user} loadingUser={loadingUser} setUser={setUser} />
        }
      />
      <Route
        path="login"
        element={
          <LoginPage user={user} loadingUser={loadingUser} setUser={setUser} loadCart={loadCart}/>
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
