<<<<<<< HEAD
import { Link } from "react-router";
import CheckoutLockIcon from "../../assets/images/icons/checkout-lock-icon.png";
import Logo from "../../assets/images/logo.png";
import MobileLogo from "../../assets/images/mobile-logo.png";
import './CheckoutHeader.css';

export function CheckoutHeader({cart}){
  let totalItems = 0
  cart.forEach(cartItem => {
    totalItems += cartItem.quantity
=======
import { Link } from "react-router-dom";
import CheckoutLockIcon from "../../assets/images/icons/checkout-lock-icon.png";
import Logo from "../../assets/images/logo.png";
import MobileLogo from "../../assets/images/mobile-logo.png";
import "./CheckoutHeader.css";

export function CheckoutHeader({ cart }) {
  let totalItems = 0;
  cart.forEach((cartItem) => {
    totalItems += cartItem.quantity;
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
  });
  return (
    <div className="checkout-header">
      <div className="header-content">
        <div className="checkout-header-left-section">
          <Link to="/">
            <img className="logo" src={Logo} />
            <img className="mobile-logo" src={MobileLogo} />
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
<<<<<<< HEAD
}
=======
}
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
