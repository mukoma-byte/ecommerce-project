import { formatMoney } from "../../utils/money";
import { useState } from "react";
import axios from "axios";
export function CartItemDetails({ cartItem, loadCart }) {
  /*
  The state showInput is used to toggle whether update has been clicked. If it has been clicked a text box is displayed...if clicked again it is hidden
  */ 
 const [showInput, setShowInput] = useState(false)

 const [quantity, setQuantity] = useState(cartItem.quantity)
  const toggleInput = () => {
    if(showInput){
      setShowInput(false)
    }else{
      setShowInput(true)
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
            {showInput ? (
              <input type="number" className="quantity-input" value={quantity} onChange={(e) => {
                setQuantity(e.target.value)
              }}/>
            ) : (
              ""
            )}
            <span className="quantity-label">{` ${cartItem.quantity}`}</span>
          </span>
          <span
            className="update-quantity-link link-primary"
            onClick={toggleInput}
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
