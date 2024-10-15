const express = require("express");
const router = express.Router();
const {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  removeConversation,
  sendMessage,
} = require("../controller/inboxController");
// const decorateHTMLResponse = require("../middlewares/common/decorateHTMLResponse");
const { checkLogin } = require("../middlewares/common/checkLogin");
const attachmentUpload = require("../middlewares/inbox/attachmentUpload");

router.get("/", checkLogin, getInbox);

router.get("/search", searchUser);
router.post("/conversation", checkLogin, addConversation);
router.get("/messages/:conversation_id", checkLogin, getMessages);
router.delete("/messages/:participant_id", checkLogin, removeConversation);
router.post("/message", checkLogin, attachmentUpload, sendMessage);

module.exports = router;
