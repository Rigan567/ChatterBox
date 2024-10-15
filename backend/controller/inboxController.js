// const escape = require("../utilities/escape");
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { unlink } = require("fs");
const path = require("path");
// const moment = require("moment");

const getInbox = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

//search Users
const searchUser = async (req, res) => {
  const query = req.query.query;
  if (!query)
    return res.status(400).json({ message: "No search query provided" });

  try {
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { mobile: { $regex: query, $options: "i" } },
      ],
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
};

const addConversation = async (req, res) => {
  try {
    // Check if the conversation already exists
    const existingConversation = await Conversation.findOne({
      "creator.id": req.user.userid,
      "participant.id": req.body.id,
    });

    if (existingConversation) {
      // If the conversation already exists, return a message
      return res.status(200).json({
        exists: true,
      });
    }

    const newConversation = new Conversation({
      creator: {
        id: req.user.userid,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      participant: {
        id: req.body.id,
        name: req.body.participant,
        avatar: req.body.avatar || null,
      },
    });
    const result = await newConversation.save();
    res.json({
      result,
      exists: false, // Flag indicating this is a new conversation
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
};

const removeConversation = async (req, res) => {
  try {
    // Find all conversations for the provided participant ID
    const conversations = await Conversation.find({
      "participant.id": req.params.participant_id,
    });

    if (conversations.length === 0) {
      return res.status(404).json({
        message: "No conversation found with the provided participant ID",
      });
    }

    // Loop through each conversation and delete associated messages and attachments
    for (const conversation of conversations) {
      // Find all messages for the current conversation
      const messages = await Message.find({
        conversation_id: conversation._id,
      });

      // Loop through each message to delete attachments (if any)
      for (const message of messages) {
        if (message.attachment && message.attachment.length > 0) {
          for (const attachment of message.attachment) {
            // Delete each attachment file
            unlink(
              path.join(
                __dirname,
                `/../public/uploads/attachments/${attachment}`
              ),
              (err) => {
                if (err) console.error("Error deleting attachment:", err);
              }
            );
          }
        }
      }

      // Delete all messages related to the current conversation
      await Message.deleteMany({
        conversation_id: conversation._id,
      });
    }

    // Delete all conversations for the provided participant ID
    const result = await Conversation.deleteMany({
      "participant.id": req.params.participant_id,
    });

    // Check if the conversations were actually deleted
    if (result.deletedCount > 0) {
      res.status(200).json({
        message:
          "Conversations and their messages have been removed successfully",
      });
    } else {
      res.status(404).json({
        message: "No conversation found with the provided participant ID",
      });
    }
  } catch (err) {
    console.error("Error removing conversation:", err);
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the conversation",
        },
      },
    });
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    });

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );

    res.status(200).json({
      data: {
        messages: messages,
        participant,
      },
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknows error occured!",
        },
      },
    });
  }
};

const sendMessage = async (req, res, next) => {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map((file) => file.filename);
      }
      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.receiverAvatar,
        },

        conversation_id: req.body.conversationId,
      });
      const result = await newMessage.save();

      //emit socket event
      req.io.emit("new_message", {
        message: {
          _id: result._id,
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userid,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          text: req.body.message,
          attachment: attachments,
          date_time: result.date_time,
        },
      });

      res.status(200).json({
        message: "Successful!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: "message text or attachment is required!",
      },
    });
  }
};

module.exports = {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  removeConversation,
  sendMessage,
};
