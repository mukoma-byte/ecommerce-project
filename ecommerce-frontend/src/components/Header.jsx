<<<<<<< HEAD
import { NavLink, useNavigate, useSearchParams } from "react-router";
=======
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import CartIcon from "../assets/images/icons/cart-icon.png";
import SearchIcon from "../assets/images/icons/search-icon.png";
import LogoWhiteIcon from "../assets/images/logo-white.png";
import MobileLogoWhiteIcon from "../assets/images/mobile-logo-white.png";
<<<<<<< HEAD
import { useState } from "react";

import "./Header.css";


export function Header({ cart }) {
  /* 
   Initialize the search input from the URL query param so the input reflects any existing ?searchText=... when the component mounts
  (useful for deep-links/bookmarks). 
  useSearchParams.get(...) can return null, so fall back to an empty string to keep the input
  controlled and avoid React's uncontrolled/controlled warnings.
  */
=======
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

export function Header({ cart }) {
  const { user, logout } = useContext(AuthContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b

  const [searchParams] = useSearchParams();
  const search = searchParams.get("searchText");
  const [searchText, setSearchText] = useState(search || "");
<<<<<<< HEAD

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

  return (
    <div className="header">
      <div className="left-section">
        <NavLink to="/" className="header-link">
          <img className="logo" src={LogoWhiteIcon} />
          <img className="mobile-logo" src={MobileLogoWhiteIcon} />
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
      </div>
    </div>
=======
  const navigate = useNavigate();

  const updateSearchInput = (e) => setSearchText(e.target.value);

  const searchProducts = () => {
    navigate(`/?searchText=${searchText}`);
    setMenuOpen(false);
  };

  let totalQuantity = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="header">
      {/* Left Section */}
      <div className="left-section">
        <NavLink to="/" className="header-link logo-link">
          <img className="logo" src={LogoWhiteIcon} alt="Logo" />
          <img
            className="mobile-logo"
            src={MobileLogoWhiteIcon}
            alt="Mobile Logo"
          />
        </NavLink>

        {/* Hamburger Menu (visible only on mobile) */}
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Middle Section (Search bar) */}
      <div className={`middle-section ${menuOpen ? "show" : ""}`}>
        <div className="search-container">
          <input
            className="search-bar"
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={updateSearchInput}
            onKeyDown={(e) => e.key === "Enter" && searchProducts()}
          />
          <button className="search-button" onClick={searchProducts}>
            <img className="search-icon" src={SearchIcon} alt="Search" />
          </button>
        </div>
      </div>

      {/* Right Section (Links + Cart + Auth) */}
      <div className={`right-section ${menuOpen ? "show" : ""}`}>
        <NavLink
          className="orders-link header-link"
          to="/orders"
          onClick={() => setMenuOpen(false)}
        >
          Orders
        </NavLink>

        {user ? (
          <>
            <NavLink
              className="profile-link header-link"
              to="/profile"
              onClick={() => setMenuOpen(false)}
            >
              {user.name || "Profile"}
            </NavLink>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              className="login-link header-link"
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
            <NavLink
              className="register-link header-link"
              to="/register"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </NavLink>
          </>
        )}

        <NavLink
          className="cart-link header-link"
          to="/checkout"
          onClick={() => setMenuOpen(false)}
        >
          <img className="cart-icon" src={CartIcon} alt="Cart" />
          <div className="cart-quantity">{totalQuantity}</div>
          <span className="cart-text">Cart</span>
        </NavLink>
      </div>
    </header>
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
  );
}
