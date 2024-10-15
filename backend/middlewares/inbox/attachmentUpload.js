const uploader = require("../../utilities/multipleUploader");

const attachmentUpload = (req, res, next) => {
  const upload = uploader(
    "attachments",
    ["image/jpeg", "image/jpg", "image/png"],
    10000000,
    3,
    "Only .jpg, .jpeg or .png format are allowed!"
  );

  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
};

module.exports = attachmentUpload;
