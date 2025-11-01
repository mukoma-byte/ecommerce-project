import { NavLink, useNavigate, useSearchParams } from "react-router";
import CartIcon from "../assets/images/icons/cart-icon.png";
import SearchIcon from "../assets/images/icons/search-icon.png";
import LogoWhiteIcon from "../assets/images/logo-white.png";
import MobileLogoWhiteIcon from "../assets/images/mobile-logo-white.png";
import StoreIcon from "../assets/images/store.png";
import { useState } from "react";
import { UserDropdown } from "./UserDropdown";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import "./Header.css";

export function Header({ cart, setCart }) {
  /* 
   Initialize the search input from the URL query param so the input reflects any existing ?searchText=... when the component mounts
  (useful for deep-links/bookmarks). 
  useSearchParams.get(...) can return null, so fall back to an empty string to keep the input
  controlled and avoid React's uncontrolled/controlled warnings.
  */

  const [searchParams] = useSearchParams();
  const search = searchParams.get("searchText");
  const [searchText, setSearchText] = useState(search || "");

  const {user, setUser} = useAuth();
  
  const navigate = useNavigate();

  const updateSearchInput = (e) => {
    setSearchText(e.target.value);
  };

  const searchProducts = () => {
    navigate(`/?searchText=${searchText}
      `);
  };
  let totalQuantity = 0;

  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );

      console.log(response.data.message);

      // Clear frontend state
      setUser(null);
      setCart([]); // optional if cart is tied to session

      // Redirect to homepage
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Something went wrong while logging out. Please try again.");
    }
  };

  return (
    <div className="header">
      <div className="left-section">
        <NavLink to="/" className="header-link">
          <span className="logo-container">
            <img className="logo" src={StoreIcon} />
            <span className="logo-text">Online store</span>
          </span>

          <img className="mobile-logo" src={StoreIcon} />
        </NavLink>
      </div>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => {
            updateSearchInput(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchProducts();
            }
          }}
        />

        <button
          className="search-button"
          onClick={() => {
            searchProducts();
          }}
        >
          <img className="search-icon" src={SearchIcon} />
        </button>
      </div>

      <div className="right-section">
        <NavLink className="orders-link header-link" to="/orders">
          <span className="orders-text">Orders</span>
        </NavLink>

        <NavLink className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src={CartIcon} />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </NavLink>
        {user ? (
          <UserDropdown user={user} onLogout={handleLogout} />
        ) : (
          <div className="auth-buttons">
            <NavLink to="/login">
              <button className="login-btn">login</button>
            </NavLink>

            <NavLink to="/register">
              <button className="Signup-btn">Sign up</button>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
