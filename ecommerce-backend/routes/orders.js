import express from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { DeliveryOption } from "../models/DeliveryOption.js";
import { requireLogin } from "../middlware/requireLogin.js";
import { CartItem } from "../models/CartItem.js";

const router = express.Router();

router.get("/", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const expand = req.query.expand;

    let orders = await Order.unscoped().findAll({
      where: { userId },
      order: [["orderTimeMs", "DESC"]],
    }); // Sort by most recent

    if (expand === "products") {
      orders = await Promise.all(
        orders.map(async (order) => {
          const products = await Promise.all(
            order.products.map(async (product) => {
              const productDetails = await Product.findByPk(product.productId);
              return {
                ...product,
                product: productDetails,
              };
            })
          );
          return {
            ...order.toJSON(),
            products,
          };
        })
      );
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const cartItems = await CartItem.findAll({where: {userId}});

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let totalCostCents = 0;
    const products = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        const deliveryOption = await DeliveryOption.findByPk(
          item.deliveryOptionId
        );
        if (!deliveryOption) {
          throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
        }
        const productCost = product.priceCents * item.quantity;
        const shippingCost = deliveryOption.priceCents;
        totalCostCents += productCost + shippingCost;
        const estimatedDeliveryTimeMs =
          Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;
        return {
          productId: item.productId,
          quantity: item.quantity,
          estimatedDeliveryTimeMs,
        };
      })
    );

    totalCostCents = Math.round(totalCostCents * 1.1);

    const order = await Order.create({
      userId,
      orderTimeMs: Date.now(),
      totalCostCents,
      products,
    });

    await CartItem.destroy({ where: {userId} });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/:orderId", requireLogin, async (req, res) => {
  const { orderId } = req.params;
  const expand = req.query.expand;

  let order = await Order.findByPk(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (expand === "products") {
    const products = await Promise.all(
      order.products.map(async (product) => {
        const productDetails = await Product.findByPk(product.productId);
        return {
          ...product,
          product: productDetails,
        };
      })
    );
    order = {
      ...order.toJSON(),
      products,
    };
  }

  res.json(order);
});

export default router;
