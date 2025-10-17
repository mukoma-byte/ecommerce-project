import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import CartIcon from "../assets/images/icons/cart-icon.png";
import SearchIcon from "../assets/images/icons/search-icon.png";
import LogoWhiteIcon from "../assets/images/logo-white.png";
import MobileLogoWhiteIcon from "../assets/images/mobile-logo-white.png";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

export function Header({ cart }) {
  const { user, logout } = useContext(AuthContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("searchText");
  const [searchText, setSearchText] = useState(search || "");
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
  );
}
