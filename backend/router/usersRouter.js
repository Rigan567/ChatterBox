const express = require("express");
const router = express.Router();
const {
  addUser,
  getUsers,
  removeUser,
} = require("../controller/usersController");
const decorateHTMLResponse = require("../middlewares/common/decorateHTMLResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");
const { checkLogin, requireRole } = require("../middlewares/common/checkLogin");

// users page
router.get("/", checkLogin, getUsers);

//add user
router.post(
  "/",
  // checkLogin,
  // requireRole(["admin"]),
  avatarUpload,
  // addUserValidators,
  // addUserValidationHandler,
  addUser
);

//removeUser
router.delete("/:userid", checkLogin, removeUser);
// router.put("/:id", checkLogin, requireRole(["admin"]), makeAdmin);
module.exports = router;
