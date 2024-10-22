import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Plus, Trash2, X, Send, ArrowLeft } from "lucide-react";
import SearchUserTab from "./SearchUserTab";
import moment from "moment";
import { toast } from "react-toastify";
import io from "socket.io-client";
import noPhoto from "../assets/images/images.jpeg";
import { apiUrl } from "../config";

export default function Inbox({ loggedInUser }) {
  const [searchUserTabOpen, setSearchUserTabOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [participant, setParticipant] = useState(null);
  const [creator, setCreator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentConversationName, setCurrentConversationName] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageContainerRef = useRef(null);
  const { register, handleSubmit, reset, watch } = useForm();
  const [displayUser, setDisplayUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (conversation.length > 0 && currentConversationId) {
      const conv = conversation.find((c) => c._id === currentConversationId);
      if (conv) {
        const isLoggedInUserAndParticipantSame =
          loggedInUser.userid === conv.participant.id;
        setDisplayUser(
          isLoggedInUserAndParticipantSame ? conv.creator : conv.participant
        );
      }
    }
  }, [conversation, currentConversationId, loggedInUser.userid]);
  useEffect(() => {
    const newSocket = io(`${apiUrl}/`, { withCredentials: true });
    newSocket.on("connect", () => setSocket(newSocket));
    newSocket.on("connect_error", (error) =>
      console.error("Socket connection error:", error)
    );
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("new_message", (data) => {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg.id === data.message._id
          );
          if (!messageExists) {
            const newMessage = {
              id: data.message._id,
              text: data.message.text,
              sender: data.message.sender,
              time: moment(data.message.date_time).fromNow(),
              attachment: data.message.attachment || [],
              isCurrentUser: data.message.sender.id === loggedInUser.userid,
            };
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      });
    }
    return () => {
      if (socket) socket.off("new_message");
    };
  }, [socket, loggedInUser.userid]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`${apiUrl}/inbox`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setConversation(result);
    } catch (error) {
      console.log(`Error Here Is: ${error}`);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  const getMessages = async (conversation_id, conversation_name) => {
    try {
      const response = await fetch(
        `${apiUrl}/inbox/messages/${conversation_id}`,
        { credentials: "include" }
      );
      const result = await response.json();
      if (!result.errors && result.data) {
        setFormVisible(true);
        const { data } = result;
        setParticipant(data.participant);
        setCreator(data.creator);
        setCurrentConversationId(conversation_id);
        setCurrentConversationName(conversation_name);
        setMessages(
          data.messages && data.messages.length > 0 ? data.messages : []
        );
        if (isMobileView) {
          setShowMessages(true);
        }
      } else {
        toast.error("Error loading messages!");
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Error loading messages!");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("message", data.message);
    if (selectedFiles) {
      selectedFiles.forEach((file) => formData.append("files", file));
    }
    formData.append("receiverId", participant.id);
    formData.append("receiverName", participant.name);
    formData.append("receiverAvatar", participant.avatar || "");
    formData.append("conversationId", currentConversationId);

    try {
      const response = await fetch(`${apiUrl}/inbox/message`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();

      if (!result.error) {
        const newMessage = {
          id: result.data._id,
          text: data.message,
          sender: {
            id: loggedInUser.userid,
            name: loggedInUser.username,
            avatar: loggedInUser.avatar,
          },
          time: moment().fromNow(),
          attachment: result.data.attachment || [],
          isCurrentUser: true,
        };

        if (socket) {
          socket.emit("new_message", {
            message: {
              ...newMessage,
              conversation_id: currentConversationId,
            },
          });
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        reset();
        setSelectedFiles([]);
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message.");
    }
  };

  const removeConversation = async (participant_id) => {
    try {
      const response = await fetch(
        `${apiUrl}/inbox/messages/${participant_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        toast.error("Cannot remove this conversation");
      } else {
        toast.success(
          `Conversation with ${participant.name} removed successfully!`
        );
        setCurrentConversationName(null);
        fetchConversation();
        if (isMobileView) {
          setShowMessages(false);
        }
      }
    } catch (error) {
      toast.error(error.msg);
    }
  };

  {
    /* //conversation section */
  }
  const ConversationList = () => (
    <section
      className={`${
        isMobileView ? "w-full" : "w-1/4"
      } bg-black/20 p-4 flex flex-col`}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-4 flex items-center justify-center p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200"
        onClick={() => setSearchUserTabOpen(!searchUserTabOpen)}
      >
        {searchUserTabOpen ? <X size={24} /> : <Plus size={24} />}
        <span className="ml-2">{searchUserTabOpen ? "Close" : "New Chat"}</span>
      </motion.button>

      <AnimatePresence>
        {searchUserTabOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SearchUserTab
              setSearchUserTabOpen={setSearchUserTabOpen}
              apiUrl={apiUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-2">
        {conversation.length > 0 ? (
          conversation.map((conv) => {
            const isLoggedInUserAndParticipantSame =
              loggedInUser.userid === conv.participant.id;
            const convDisplayUser = isLoggedInUserAndParticipantSame
              ? conv.creator
              : conv.participant;

            return (
              <motion.div
                key={conv._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black/10 p-3 rounded-lg cursor-pointer hover:bg-black/20 transition-colors duration-200"
                onClick={() => getMessages(conv._id, convDisplayUser.name)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={
                      convDisplayUser?.avatar
                        ? `${apiUrl}/uploads/avatars/${convDisplayUser.avatar}`
                        : noPhoto
                    }
                    alt={`${convDisplayUser.name}'s avatar`}
                  />
                  <div>
                    <h4 className="text-white font-semibold">
                      {convDisplayUser.name}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {moment(conv.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-gray-400">No conversations yet.</p>
        )}
      </div>
    </section>
  );

  {
    /* Message Section  */
  }
  const MessageSection = () => (
    <section className="flex-1 flex flex-col bg-black/10">
      {currentConversationName ? (
        <>
          <div className="flex justify-between items-center px-6 py-4 bg-black/20">
            {isMobileView && (
              <button
                onClick={() => setShowMessages(false)}
                className="text-white mr-2"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="flex items-center space-x-3">
              {displayUser && (
                <img
                  src={
                    displayUser.avatar
                      ? `${apiUrl}/uploads/avatars/${displayUser.avatar}`
                      : noPhoto
                  }
                  alt={displayUser.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}

              <h3 className="text-white text-lg font-semibold">
                {currentConversationName}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-red-500 hover:text-red-600"
              onClick={() => removeConversation(participant.id)}
            >
              <Trash2 size={20} />
            </motion.button>
          </div>
          {/* Message Container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const sender = message.sender || {};
                const senderAvatar = sender.avatar
                  ? `${apiUrl}/uploads/avatars/${sender.avatar}`
                  : `${noPhoto}`;
                const isCurrentUser = sender.id === loggedInUser.userid;
                return (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && sender.name && (
                      <img
                        src={senderAvatar}
                        alt={sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        isCurrentUser ? "bg-purple-600" : "bg-gray-700"
                      } rounded-lg px-4 py-2 shadow-md`}
                    >
                      <p className="text-white">{message.text}</p>
                      {message.attachment && message.attachment.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.attachment.map((attachment, idx) => (
                            <img
                              key={idx}
                              src={`${apiUrl}/uploads/attachments/${attachment}`}
                              alt="attachment"
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {moment(message.date_time).fromNow()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No messages yet</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-black/20">
            <div className="flex items-center space-x-2">
              <motion.label
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer text-gray-400 hover:text-gray-200"
              >
                <Paperclip size={20} />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </motion.label>
              <input
                {...register("message", {
                  required: selectedFiles.length === 0,
                })}
                className="flex-1 bg-black/10 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type a message..."
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!selectedFiles.length && !watch("message")}
                className={`rounded-full p-2 transition-colors duration-200 ${
                  !selectedFiles.length && !watch("message")
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                <Send size={20} />
              </motion.button>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFiles((files) =>
                          files.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-2xl text-gray-400">
            Select a conversation to start chatting
          </p>
        </div>
      )}
    </section>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-16 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl shadow-2xl h-[calc(100vh-4rem)] w-full flex overflow-hidden"
    >
      {isMobileView ? (
        showMessages ? (
          <MessageSection />
        ) : (
          <ConversationList />
        )
      ) : (
        <>
          <ConversationList />
          <MessageSection />
        </>
      )}
    </motion.div>
  );
}
