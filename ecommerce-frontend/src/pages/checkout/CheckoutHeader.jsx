import { Link } from "react-router";
import CheckoutLockIcon from "../../assets/images/icons/checkout-lock-icon.png";
import StoreIcon from "../../assets/images/store-black.png";
import './CheckoutHeader.css';

export function CheckoutHeader({cart}){
  let totalItems = 0
  cart.forEach(cartItem => {
    totalItems += cartItem.quantity
  });
  return (
    <div className="checkout-header">
      <div className="header-content">
        <div className="checkout-header-left-section">
          <Link to="/" className="header-link">
            <span className="logo-container">
              <img className="logo" src={StoreIcon} />
              <span className="logo-text">Online store</span>
            </span>

            <img className="mobile-logo" src={StoreIcon} />
          </Link>
        </div>

        <div className="checkout-header-middle-section">
          Checkout (
          <Link className="return-to-home-link" to="/">
            {totalItems} items
          </Link>
          )
        </div>

        <div className="checkout-header-right-section">
          <img src={CheckoutLockIcon} />
        </div>
      </div>
    </div>
  );
}