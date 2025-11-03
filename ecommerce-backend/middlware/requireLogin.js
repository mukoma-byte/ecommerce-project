// middleware/requireLogin.js
export const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to access this resource.",
    });
  }
  next();
};
