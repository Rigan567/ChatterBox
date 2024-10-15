const express = require("express");
const router = express.Router();
const { login, logout } = require("../controller/loginController");

const { checkLogin } = require("../middlewares/common/checkLogin");

router.post("/login", login);

router.post("/logout", logout);

router.get("/check-login", checkLogin, (req, res) => {
  let loggedIn = req.user ? true : false;
  let loggedInUser = req.user;
  res.json({ loggedIn, loggedInUser });
});

module.exports = router;
