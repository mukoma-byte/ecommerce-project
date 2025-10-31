import express from "express";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { DeliveryOption } from "../models/DeliveryOption.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const expand = req.query.expand;
  const userId = req.session.user?.id;
  const sessionId = req.session.id;

  console.log("🧾 CART DEBUG:", { userId, sessionId });

  console.log(userId ? { userId } : { sessionId });

  let whereClause = userId ? { userId } : { sessionId };

  let cartItems = await CartItem.findAll({
    where: whereClause,
  });
  console.log("🧾 CART ITEMS FOUND:", cartItems.length);
  if (expand === "product") {
    cartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        return {
          ...item.toJSON(),
          product,
        };
      })
    );
  }

  res.json(cartItems);
});

router.post("/", async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.user?.id;
  const sessionId = req.session.id;

  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(400).json({ error: "Product not found" });
  }

  if (typeof quantity !== "number" || quantity < 1 || quantity > 10) {
    return res
      .status(400)
      .json({ error: "Quantity must be a number between 1 and 10" });
  }

  const whereClause = userId ? { userId, productId } : { sessionId, productId };
  let cartItem = await CartItem.findOne({ where: whereClause });
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      productId,
      quantity,
      deliveryOptionId: "1",
      userId: userId || null,
      sessionId: userId ? null : sessionId,
    });
  }

  res.status(201).json(cartItem);
});

router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { quantity, deliveryOptionId } = req.body;

  const userId = req.session.user?.id;
  const sessionId = req.session.id;

  const whereClause = userId ? { userId, productId } : { sessionId, productId };

  const cartItem = await CartItem.findOne({ where: whereClause });
  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }

  if (quantity !== undefined) {
    if (typeof quantity !== "number" || quantity < 1) {
      return res
        .status(400)
        .json({ error: "Quantity must be a number greater than 0" });
    }
    cartItem.quantity = quantity;
  }

  if (deliveryOptionId !== undefined) {
    const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
    if (!deliveryOption) {
      return res.status(400).json({ error: "Invalid delivery option" });
    }
    cartItem.deliveryOptionId = deliveryOptionId;
  }

  await cartItem.save();
  res.json(cartItem);
});

router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;

  const userId = req.session.user?.id;
  const sessionId = req.session.id;

  const whereClause = userId ? { userId, productId } : { sessionId, productId };

  const cartItem = await CartItem.findOne({ where: whereClause });

  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }

  await cartItem.destroy();
  res.status(204).send();
});

export default router;
