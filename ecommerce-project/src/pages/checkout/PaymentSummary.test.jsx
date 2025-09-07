import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router";
import { PaymentSummary } from "./PaymentSummary";

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

    const paymentSummaryElement = screen.getByTestId('payment-summary')
    expect(paymentSummaryElement).toHaveTextContent("Items (10):");
    expect(paymentSummaryElement).toHaveTextContent("$149.20");
    expect(paymentSummaryElement).toHaveTextContent('Shipping & handling:');
    expect(paymentSummaryElement).toHaveTextContent("$4.99");
    expect(paymentSummaryElement).toHaveTextContent("Total before tax:");
    expect(paymentSummaryElement).toHaveTextContent("$154.19");
    expect(paymentSummaryElement).toHaveTextContent("Estimated tax (10%):");
    expect(paymentSummaryElement).toHaveTextContent("$15.42");
    expect(paymentSummaryElement).toHaveTextContent("Order total:");
    expect(paymentSummaryElement).toHaveTextContent("$169.61");
  });
});
