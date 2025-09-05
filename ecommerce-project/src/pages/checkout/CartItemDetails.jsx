import { formatMoney } from "../../utils/money";
import { useState } from "react";
import axios from "axios";
export function CartItemDetails({ cartItem, loadCart }) {
  const [updateQuantity, setUpdateQuantity] = useState(false)
  const updateQuantityState = () => {
    if(updateQuantity){
      setUpdateQuantity(false)
    }else{
      setUpdateQuantity(true)
    }
  }
  const deleteCartItem = async () => {
    await axios.delete(`/api/cart-items/${cartItem.productId}`);
    await loadCart();
  };
  return (
    <>
      <img className="product-image" src={cartItem.product.image} />
      <div className="cart-item-details">
        <div className="product-name">{cartItem.product.name}</div>
        <div className="product-price">
          {formatMoney(cartItem.product.priceCents)}
        </div>
        <div className="product-quantity">
          <span>
            Quantity:
            {updateQuantity ? (
              <input type="text" className="quantity-input" />
            ) : (
              ""
            )}
            <span className="quantity-label">{` ${cartItem.quantity}`}</span>
          </span>
          <span
            className="update-quantity-link link-primary"
            onClick={updateQuantityState}
          >
            Update
          </span>
          <span
            className="delete-quantity-link link-primary"
            onClick={deleteCartItem}
          >
            Delete
          </span>
        </div>
      </div>
    </>
  );
}
