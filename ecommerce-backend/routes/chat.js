import express from "express";

const router = express.Router();

// Simple knowledge base - you can move this to a separate file
const responsesData = {
  intents: [
    {
      tag: "track_order",
      patterns: [
        "track order",
        "where is my order",
        "order status",
        "package tracking",
      ],
      responses: [
        "You can track your order by visiting the 'Orders' page in your account. You'll need your order number which was sent to your email.",
      ],
    },
    {
      tag: "reset_password",
      patterns: [
        "forgot password",
        "reset password",
        "can't login",
        "change password",
      ],
      responses: [
        "To reset your password, go to the login page and click 'Forgot Password'. Enter your email to receive a reset link.",
      ],
    },
    {
      tag: "return_policy",
      patterns: [
        "return item",
        "return policy",
        "how to return",
        "refund policy",
      ],
      responses: [
        "We offer a 30-day return policy for unused items. You can initiate a return from your 'Orders' page or contact support.",
      ],
    },
    {
      tag: "shipping_info",
      patterns: [
        "shipping time",
        "delivery time",
        "how long to ship",
        "shipping cost",
      ],
      responses: [
        "Standard shipping takes 5-7 business days ($4.99). Express shipping takes 2 business days ($12.99). Orders before 2 PM PST ship same day.",
      ],
    },
    {
      tag: "account_help",
      patterns: [
        "create account",
        "how to sign up",
        "register",
        "make account",
      ],
      responses: [
        "You can create an account by clicking 'Register' in the top navigation. You'll need your email address and to create a password.",
      ],
    },
    {
      tag: "checkout_help",
      patterns: [
        "how to checkout",
        "place order",
        "complete purchase",
        "buy items",
      ],
      responses: [
        "To checkout, add items to your cart and click the cart icon. Review your items and proceed through the checkout steps.",
      ],
    },
  ],
  fallback: [
    "I'm not sure I understand. Could you try rephrasing your question?",
    "I'm still learning! Try asking about order tracking, returns, shipping, or your account.",
    "I don't have an answer for that yet. Please contact our support team for more specific help.",
  ],
};

// Simple intent matching
function findBestMatch(userInput) {
  const input = userInput.toLowerCase();

  for (const intent of responsesData.intents) {
    for (const pattern of intent.patterns) {
      if (input.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }

  return null;
}

router.post("/message", (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const matchedIntent = findBestMatch(message);

    if (matchedIntent) {
      const randomResponse =
        matchedIntent.responses[
          Math.floor(Math.random() * matchedIntent.responses.length)
        ];

      res.json({
        response: randomResponse,
        intent: matchedIntent.tag,
      });
    } else {
      const randomFallback =
        responsesData.fallback[
          Math.floor(Math.random() * responsesData.fallback.length)
        ];

      res.json({
        response: randomFallback,
        intent: "fallback",
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      response: "Sorry, I encountered an error. Please try again.",
      intent: "error",
    });
  }
});

export default router;
