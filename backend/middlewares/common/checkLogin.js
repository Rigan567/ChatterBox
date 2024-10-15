const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      token = cookies[process.env.COOKIE_NAME];
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

// const redirectLoggedIn = (req, res, next) => {
//   const token = req.signedCookies[process.env.COOKIE_NAME];
//   console.log(token);

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       if (decoded) {
//         return res.redirect("/inbox");
//       }
//     } catch (error) {
//       // If there's an error verifying the token, clear the cookie
//       res.clearCookie(process.env.COOKIE_NAME);
//       console.log("Error verifying token:", error);
//     }
//   }
//   next();
// };

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role && role.includes(req.user.role)) {
      next();
    } else {
      if (res.locals.html) {
        next(
          createHttpError(401, "You are not authorized to access this page")
        );
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "You are not authorized to access this page",
            },
          },
        });
      }
    }
  };
};

module.exports = { checkLogin, requireRole };
