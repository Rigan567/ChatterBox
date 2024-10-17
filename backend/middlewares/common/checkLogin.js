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

      next();
    } catch (error) {
      // If token verification fails, send a 401 Unauthorized error
      next(createHttpError(401, "Invalid token, please login again."));
    }
  } else {
    // If no signed cookies exist, send a 403 Forbidden error
    next(createHttpError(403, "No token provided, access denied."));
  }
};

module.exports = { checkLogin };
