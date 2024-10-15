const User = require("../models/People");
const bcrypt = require("bcryptjs");
// const { cookie } = require("express-validator");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// const getLogin = (req, res, next) => {
//   res.render("index");
// };

const login = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPassword) {
        const userObject = {
          userid: user._id,
          username: user.name,
          mobile: user.mobile,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "user",
        };
        //generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        //generate cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        res.status(200).json({ message: "Login successful", user: userObject });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = (req, res) => {
  // clear cookie
  res.clearCookie(process.env.COOKIE_NAME);
  res.json({ message: "logged out" });
};

module.exports = {
  login,
  logout,
};
