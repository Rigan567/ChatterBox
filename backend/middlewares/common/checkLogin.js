const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies && cookies[process.env.COOKIE_NAME]) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("Cookies:", req.cookies);
      console.log("Signed Cookies:", req.signedCookies);
      next();
    } catch (error) {
      res
        .status(401)
        .json({ loggedIn: false, error: "Invalid token, please login again." });
    }
  } else {
    res
      .status(403)
      .json({ loggedIn: false, error: "No token provided, access denied." });
  }
};

module.exports = { checkLogin };
