const bcrypt = require("bcryptjs");
const User = require("../models/People");
const { unlink } = require("fs");
const path = require("path");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const addUser = async (req, res, next) => {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
  }

  try {
    const result = await newUser.save();
    // console.log(result);
    res.status(200).json({
      message: "User was added successfully!",
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown Error Occured !!",
        },
      },
    });
  }
  next();
};

const removeUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.avatar) {
      unlink(
        path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    });
    await Conversation.deleteMany({
      $or: [
        { "creator.id": req.params.userid },
        { "participant.id": req.params.userid },
      ],
    });
    // Delete all messages associated with those conversations
    for (const conversation of conversations) {
      const messages = await Message.find({
        conversation_id: conversation._id,
      });

      // Delete all attachments associated with messages
      for (const message of messages) {
        if (message.attachment && message.attachment.length > 0) {
          message.attachment.forEach((attachment) => {
            unlink(
              path.join(
                __dirname,
                `/../public/uploads/attachments/${attachment}`
              ),
              (err) => {
                if (err) console.error("Error deleting attachment:", err);
              }
            );
          });
        }
      }
      await Message.deleteMany({
        conversation_id: conversation._id,
      });

      res.status(200).json({
        message: "User was removed successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user",
        },
      },
    });
  }
};
// const makeAdmin = async (req, res, next) => {
//   try {
//     const user = await User.findById({
//       _id: req.params.id,
//     });
//     if (user) {
//       user.role = user.role === "admin" ? "user" : "admin";
//       await user.save();
//       const message =
//         user.role === "admin" ? "User is set as admin" : "User is set as user";

//       res.status(200).json({
//         message: message,
//       });
//     } else {
//       res.status(404).json({
//         errors: {
//           common: {
//             msg: "User not found",
//           },
//         },
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       errors: {
//         common: {
//           msg: "Could not make the user as an admin",
//         },
//       },
//     });
//   }
// };
module.exports = { addUser, getUsers, removeUser };
