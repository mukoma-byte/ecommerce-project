// server.js or routes/chat.js
import express from "express";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load products from JSON file
let products = [];

async function loadProducts() {
  try {
    const data = await readFile(join(__dirname, "products.json"), "utf8");
    const productData = JSON.parse(data);

    // Handle both { products: [] } and direct array formats
    products = Array.isArray(productData)
      ? productData
      : productData.products || [];

    console.log(`✅ Loaded ${products.length} products from JSON file`);
  } catch (error) {
    console.error("❌ Error loading products JSON:", error);
    // Fallback to empty array
    products = [];
  }
}

// Load products when server starts
await loadProducts();

// Function to search products based on criteria
function searchProducts(category, maxPrice, minPrice, searchTerm) {
  let results = [...products];

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (maxPrice !== undefined) {
    results = results.filter((p) => p.price <= maxPrice);
  }

  if (minPrice !== undefined) {
    results = results.filter((p) => p.price >= minPrice);
  }

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
router.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

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
              category: {
                type: "string",
                description:
                  "Product category (e.g., 'socks', 'shoes', 'shirts')",
              },
              maxPrice: {
                type: "number",
                description: "Maximum price in dollars",
              },
              minPrice: {
                type: "number",
                description: "Minimum price in dollars",
              },
              searchTerm: {
                type: "string",
                description:
                  "Keywords to search in product name or description",
              },
            },
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful shopping assistant for an e-commerce store. 
          Help users find products they're looking for. When users ask about products, 
          use the search_products function to find relevant items. Be friendly and concise.
          
          Available product categories: ${[
            ...new Set(products.map((p) => p.category)),
          ].join(", ")}
          Price range: $${Math.min(
            ...products.map((p) => p.price)
          )} - $${Math.max(...products.map((p) => p.price))}`,
        },
        ...messages,
      ],
      tools: tools,
      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === "search_products") {
        const foundProducts = searchProducts(
          functionArgs.category,
          functionArgs.maxPrice,
          functionArgs.minPrice,
          functionArgs.searchTerm
        );

        const secondResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful shopping assistant. Present product results in a friendly way.
              If no products were found, suggest other categories or price ranges.`,
            },
            ...messages,
            assistantMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(foundProducts),
            },
          ],
        });

        res.json({
          message: secondResponse.choices[0].message.content,
          products: foundProducts.slice(0, 10), // Limit to 10 products
        });
      }
    } else {
      res.json({
        message: assistantMessage.content,
        products: [],
      });
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
});

export default router;
