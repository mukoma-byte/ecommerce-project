// routes/chat.js
import express from "express";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();

// Initialize OpenAI with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your products.json
const productsPath = join(__dirname, "../backend/products.json");

// Load products from JSON file
let products = [];

async function loadProducts() {
  try {
    const data = await readFile(productsPath, "utf8");
    const productData = JSON.parse(data);

    // Handle both { products: [] } and direct array formats
    products = Array.isArray(productData)
      ? productData
      : productData.products || [];

    console.log(`✅ Loaded ${products.length} products from JSON file`);
  } catch (error) {
    console.error("❌ Error loading products JSON:", error);
    products = [];
  }
}

// Load products at startup
await loadProducts();

// Function to search products
function searchProducts(category, maxPrice, minPrice, searchTerm) {
  let results = [...products];

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (maxPrice !== undefined)
    results = results.filter((p) => p.price <= maxPrice);
  if (minPrice !== undefined)
    results = results.filter((p) => p.price >= minPrice);

  if (searchTerm) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags &&
          p.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );
  }

  return results;
}

// Chat endpoint
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    // Tool definition
    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description:
            "Search for products in the store based on category, price range, or keywords",
          parameters: {
            type: "object",
            properties: {
              category: { type: "string", description: "Product category" },
              maxPrice: {
                type: "number",
                description: "Maximum price in dollars",
              },
              minPrice: {
                type: "number",
                description: "Minimum price in dollars",
              },
              searchTerm: { type: "string", description: "Keywords to search" },
            },
          },
        },
      },
    ];

    // Call OpenAI
    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Free-tier friendly
        messages: [
          {
            role: "system",
            content: `You are a helpful shopping assistant for an e-commerce store. 
            Available categories: ${[
              ...new Set(products.map((p) => p.category)),
            ].join(", ")}.
            Price range: $${Math.min(
              ...products.map((p) => p.price)
            )} - $${Math.max(
              ...products.map((p) => p.price)
            )}. Use the search_products function when needed.`,
          },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
      });
    } catch (err) {
      // Handle free-tier quota exceeded
      if (err.code === "insufficient_quota" || err.status === 429) {
        return res.json({
          message:
            "Sorry, the AI assistant is temporarily unavailable due to API limits.",
          products: [],
        });
      } else {
        throw err;
      }
    }

    const assistantMessage = response.choices[0].message;

    // Handle tool calls locally without making a second OpenAI call
    if (assistantMessage?.tool_calls?.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let foundProducts = [];
      if (functionName === "search_products") {
        foundProducts = searchProducts(
          functionArgs.category,
          functionArgs.maxPrice,
          functionArgs.minPrice,
          functionArgs.searchTerm
        );
      }

      // Format a friendly assistant message locally
      const productText =
        foundProducts.length > 0
          ? foundProducts
              .slice(0, 10)
              .map((p) => `• ${p.name} - $${p.price}`)
              .join("\n")
          : "No products found. Try different categories or price ranges.";

      return res.json({
        message: `Here are the products I found:\n${productText}`,
        products: foundProducts.slice(0, 10),
      });
    }

    // If no tool call, just return the assistant's message
    res.json({
      message: assistantMessage.content,
      products: [],
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
});

export default router;
