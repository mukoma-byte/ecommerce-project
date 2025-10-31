import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const CartItem = sequelize.define(
  "CartItem",
  {
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryOptionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "DeliveryOptions",
        key: "id",
      },
    },
    sessionId: {
      type: DataTypes.STRING, // for guest users
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID, // for logged-in users
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE(3),
    },
    updatedAt: {
      type: DataTypes.DATE(3),
    },
  },
  {
    defaultScope: {
      order: [["createdAt", "ASC"]],
    },
  }
);
