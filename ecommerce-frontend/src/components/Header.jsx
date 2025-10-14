import { NavLink, useNavigate, useSearchParams } from "react-router";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // ✅ import your AuthContext

import CartIcon from "../assets/images/icons/cart-icon.png";
import SearchIcon from "../assets/images/icons/search-icon.png";
import LogoWhiteIcon from "../assets/images/logo-white.png";
import MobileLogoWhiteIcon from "../assets/images/mobile-logo-white.png";

import "./Header.css";

export function Header({ cart }) {
  // Initialize search input from URL
  const [searchParams] = useSearchParams();
  const search = searchParams.get("searchText");
  const [searchText, setSearchText] = useState(search || "");

  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext); // ✅ access auth state

  const updateSearchInput = (e) => setSearchText(e.target.value);

  const searchProducts = () => {
    navigate(`/?searchText=${searchText}`);
  };

  // calculate total cart quantity
  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  return (
    <div className="header">
      {/* LEFT SECTION — LOGO */}
      <div className="left-section">
        <NavLink to="/" className="header-link">
          <img className="logo" src={LogoWhiteIcon} alt="Logo" />
          <img
            className="mobile-logo"
            src={MobileLogoWhiteIcon}
            alt="Mobile Logo"
          />
        </NavLink>
      </div>

      {/* MIDDLE SECTION — SEARCH */}
      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={updateSearchInput}
          onKeyDown={(e) => e.key === "Enter" && searchProducts()}
        />
        <button className="search-button" onClick={searchProducts}>
          <img className="search-icon" src={SearchIcon} alt="Search" />
        </button>
      </div>

      {/* RIGHT SECTION — CART / AUTH LINKS */}
      <div className="right-section">
        {/* Orders link (optional — only visible if logged in) */}
        {user && (
          <NavLink className="orders-link header-link" to="/orders">
            <span className="orders-text">Orders</span>
          </NavLink>
        )}

        {/* Cart link (always visible) */}
        <NavLink className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src={CartIcon} alt="Cart" />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </NavLink>

        {/* Authentication section */}
        {!user ? (
          // 👇 If not logged in
          <div className="auth-links">
            <NavLink to="/login" className="header-link">
              Login
            </NavLink>
            <span className="divider"> | </span>
            <NavLink to="/register" className="header-link">
              Register
            </NavLink>
          </div>
        ) : (
          // 👇 If logged in
          <div className="auth-user">
            <NavLink to="/profile" className="header-link user-name">
              {user.name || "My Profile"}
            </NavLink>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
