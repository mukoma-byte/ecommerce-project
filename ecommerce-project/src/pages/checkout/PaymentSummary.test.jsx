import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, useLocation } from "react-router";
import { PaymentSummary } from "./PaymentSummary";
vi.mock("axios");

function Location() {
  const location = useLocation();
  return <div data-testid="url-path">{location.pathname}</div>;
}

describe("PaymentSummary component", () => {
  let loadCart;
  let paymentSummary;

  beforeEach(() => {
    loadCart = vi.fn();

    paymentSummary = {
      totalItems: 10,
      productCostCents: 14920,
      shippingCostCents: 499,
      totalCostBeforeTaxCents: 15419,
      taxCents: 1542,
      totalCostCents: 16961,
    };
  });
  it("displays the correct payment summary", () => {
    render(
      <MemoryRouter>
        <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
      </MemoryRouter>
    );

    const paymentSummaryElement = screen.getByTestId("payment-summary");
    expect(paymentSummaryElement).toHaveTextContent("Items (10):");
    expect(paymentSummaryElement).toHaveTextContent("$149.20");
    expect(paymentSummaryElement).toHaveTextContent("Shipping & handling:");
    expect(paymentSummaryElement).toHaveTextContent("$4.99");
    expect(paymentSummaryElement).toHaveTextContent("Total before tax:");
    expect(paymentSummaryElement).toHaveTextContent("$154.19");
    expect(paymentSummaryElement).toHaveTextContent("Estimated tax (10%):");
    expect(paymentSummaryElement).toHaveTextContent("$15.42");
    expect(paymentSummaryElement).toHaveTextContent("Order total:");
    expect(paymentSummaryElement).toHaveTextContent("$169.61");
  });

  it("works when place order it clicked", async () => {
    render(
      <MemoryRouter>
        <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
        <Location />
      </MemoryRouter>
    );

    const placeOrderBtn = screen.getByTestId("place-order-btn");
    const locationDiv = screen.getByTestId("url-path");
    const user = userEvent.setup();

    await user.click(placeOrderBtn);

    expect(axios.post).toHaveBeenCalledWith("/api/orders");
    expect(loadCart).toBeCalled();
    // All of this location crap is used to check whether navigate function was calledin in they paymentsummary component, triggered in a function that runs when place order button is clicked
    expect(locationDiv).toHaveTextContent("/orders");
  });
});
