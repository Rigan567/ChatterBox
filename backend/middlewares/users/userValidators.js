const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");

const User = require("../../models/People");

//add user
const addUserValidators = [
  check("name")
    .isLength({ min: 2 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name mustnot contain anything other than alphabet")
    .trim(),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError("Email already in use");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),

  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage("Must be a valid BD Number (+880)")
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          throw createError("Mobile Number already in use");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),

  check("password")
    .isStrongPassword()
    .withMessage("Password must contain atleast 8 characters"),
];

const addUserValidationHandler = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    //remove uploaded file
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(
        path.join(__dirname, `/../public/uploads/avatars/${filename}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    res.status(500).json({
      errors: mappedErrors,
    });
  }
};
module.exports = { addUserValidators, addUserValidationHandler };
