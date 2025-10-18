import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
<<<<<<< HEAD
import { MemoryRouter } from "react-router";
=======
import { MemoryRouter } from "react-router-dom";
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import { HomePage } from "./HomePage";

vi.mock("axios");

describe("HomePage component", () => {
  let loadCart;
  beforeEach(() => {
    loadCart = vi.fn();

    // Incase you are wondering how the code  below works go watch supersimpledev lesson 9 at around 40 min into the video.
    axios.get.mockImplementation(async (urlPath) => {
      if (urlPath === "/api/products") {
        return {
          data: [
            {
              id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
              image: "images/products/athletic-cotton-socks-6-pairs.jpg",
              name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
              rating: {
                stars: 4.5,
                count: 87,
              },
              priceCents: 1090,
              keywords: ["socks", "sports", "apparel"],
            },
            {
              id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
              image: "images/products/intermediate-composite-basketball.jpg",
              name: "Intermediate Size Basketball",
              rating: {
                stars: 4,
                count: 127,
              },
              priceCents: 2095,
              keywords: ["sports", "basketballs"],
            },
          ],
        };
      } else {
        return "Might be searching....";
      }
    });
  });

  it("displays the products corretly", async () => {
    render(
      <MemoryRouter>
        <HomePage cart={[]} loadCart={loadCart} />
      </MemoryRouter>
    );

<<<<<<< HEAD
    const productContainers = await screen.findAllByTestId('product-container');

    expect(productContainers.length).toBe(2)
=======
    const productContainers = await screen.findAllByTestId("product-container");

    expect(productContainers.length).toBe(2);
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b

    expect(
      within(productContainers[0]).getByText(
        "Black and Gray Athletic Cotton Socks - 6 Pairs"
      )
    ).toBeInTheDocument();

    expect(
      within(productContainers[1]).getByText("Intermediate Size Basketball")
    ).toBeInTheDocument();
  });

  it("adds a product to the cart", async () => {
<<<<<<< HEAD
      render(
        <MemoryRouter>
          <HomePage cart={[]} loadCart={loadCart} />
        </MemoryRouter>
      );
    const productContainers = await screen.findAllByTestId("product-container");

    const user = userEvent.setup();

    const quantitySelector1 = within(productContainers[0]).getByTestId(
      "quantity-selector"
    );
    const quantitySelector2 = within(productContainers[1]).getByTestId(
      "quantity-selector"
    );

    user.selectOptions(quantitySelector1, "2");

    user.selectOptions(quantitySelector2, '3')
=======
    render(
      <MemoryRouter>
        <HomePage cart={[]} loadCart={loadCart} />
      </MemoryRouter>
    );
    const productContainers = await screen.findAllByTestId("product-container");

    const user = userEvent.setup();

    const quantitySelector1 = within(productContainers[0]).getByTestId(
      "quantity-selector"
    );
    const quantitySelector2 = within(productContainers[1]).getByTestId(
      "quantity-selector"
    );

    user.selectOptions(quantitySelector1, "2");

    user.selectOptions(quantitySelector2, "3");
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b

    const addToCartButton1 = within(productContainers[0]).getByTestId(
      "add-to-cart-button"
    );
    const addToCartButton2 = within(productContainers[1]).getByTestId(
      "add-to-cart-button"
    );

    await user.click(addToCartButton1);
    expect(axios.post).toHaveBeenNthCalledWith(1, "/api/cart-items", {
      productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      quantity: 2,
    });

    await user.click(addToCartButton2);
    expect(axios.post).toHaveBeenNthCalledWith(2, "/api/cart-items", {
      productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
      quantity: 3,
    });
<<<<<<< HEAD
     
    expect(loadCart).toHaveBeenCalledTimes(2)

  })
=======

    expect(loadCart).toHaveBeenCalledTimes(2);
  });
>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
});
