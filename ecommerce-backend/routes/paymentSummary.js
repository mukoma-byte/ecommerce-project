import express from "express";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { DeliveryOption } from "../models/DeliveryOption.js";

const router = express.Router();

// Helper to get where clause
const getWhereClause = (req) => {
  const userId = req.session.user?.id;
  const sessionId = req.session.id;
  return userId ? { userId } : { sessionId };
};

router.get("/", async (req, res) => {
  try {
    const whereClause = getWhereClause(req);
    console.log("💰 PAYMENT SUMMARY REQUEST:", whereClause);

    // 1️⃣ Get cart items for this user/session
    const cartItems = await CartItem.findAll({ where: whereClause });

    console.log("🧾 CART ITEMS FOUND:", cartItems.length);

    // 2️⃣ If no cart items, return zeros
    if (cartItems.length === 0) {
      return res.json({
        totalItems: 0,
        productCostCents: 0,
        shippingCostCents: 0,
        totalCostBeforeTaxCents: 0,
        taxCents: 0,
        totalCostCents: 0,
      });
    }

    // 3️⃣ Fetch related data manually
    const detailedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        const deliveryOption = await DeliveryOption.findByPk(
          item.deliveryOptionId
        );

        return {
          ...item.toJSON(),
          product,
          deliveryOption,
        };
      })
    );

    // 4️⃣ Compute totals
    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    for (const item of detailedItems) {
      totalItems += item.quantity;
      productCostCents += (item.product?.priceCents || 0) * item.quantity;
      shippingCostCents += item.deliveryOption?.priceCents || 0;
    }

    const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
    const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
    const totalCostCents = totalCostBeforeTaxCents + taxCents;

    console.log("💰 PAYMENT SUMMARY:", { totalItems, totalCostCents });

    res.json({
      totalItems,
      productCostCents,
      shippingCostCents,
      totalCostBeforeTaxCents,
      taxCents,
      totalCostCents,
    });
  } catch (error) {
    console.error("Payment summary error:", error);
    res.status(500).json({ error: "Failed to calculate payment summary" });
  }
});

export default router;
