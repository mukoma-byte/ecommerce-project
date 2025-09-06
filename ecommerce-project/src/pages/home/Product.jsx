import { useState } from "react";
import { formatMoney } from "../../utils/money";
import axios from "axios";
import CheckmarkIcon from "../../assets/images/icons/checkmark.png";
/*
We ran into a bug where clicking on a product’s quantity would update all product quantities at once. The issue was that every product was sharing the same piece of state, instead of each product managing its own state.

Our first fix was to move the state inside the .map() function so that each product had its own state. While that solved the immediate problem, it introduced some bottlenecks and wasn’t the most efficient approach.

The final solution was to separate the product into its own component. This way, each product has its own isolated state, while still being managed cleanly from the top level. That structure eliminated the bug and kept the code more scalable.
*/
export function Product({ product, loadCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isItemInCart, setIsItemInCart] = useState(false);
  const addToCart = async () => {
    await axios.post("/api/cart-items", {
      productId: product.id,
      quantity,
      // quantity: quantity,
    });

    await loadCart();
    setIsItemInCart(true);
    setTimeout(() => {
      setIsItemInCart(false);
    }, 2000);
  };

  function selectQuantity(e) {
    const quantitySelected = Number(e.target.value);
    setQuantity(quantitySelected);
  }
  return (
    <div className="product-container" data-testid="product-container">
      <div className="product-image-container">
        <img
          className="product-image"
          data-testid="product-image"
          src={product.image}
        />
      </div>

      <div className="product-name limit-text-to-2-lines">{product.name}</div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          data-testid="product-rating-stars"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
        />
        <div className="product-rating-count link-primary">
          {product.rating.count}
        </div>
      </div>

      <div className="product-price">{formatMoney(product.priceCents)}</div>

      <div className="product-quantity-container">
        <select value={quantity} onChange={selectQuantity}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className="product-spacer"></div>

      <div className="added-to-cart" style={{ opacity: isItemInCart ? 1 : 0 }}>
        <img src={CheckmarkIcon} />
        Added
      </div>

      <button
        className="add-to-cart-button button-primary"
        data-testid="add-to-cart-button"
        onClick={addToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
