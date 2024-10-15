import { CirclePlus, Paperclip, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import SearchUserTab from "./SearchUserTab";
import moment from "moment";
import { toast } from "react-toastify";
import io from "socket.io-client";
import noPhoto from "../assets/images/images.jpeg";

function Inbox({ loggedInUser }) {
  const [searchUserTabOpen, setSearchUserTabOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [participant, setParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentConversationName, setCurrentConversationName] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageContainerRef = useRef(null); // Create a ref to the message container

  useEffect(() => {
    const newSocket = io("https://chatterbox-9gu6.onrender.com", {
      withCredentials: true,
    });
    newSocket.on("connect", () => {
      // console.log("Connected to socket server");
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("new_message", (data) => {
        // console.log("Received new message:", data);
        setMessages((prevMessages) => {
          // Check if the message is already in the list to avoid duplicates
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
      if (socket) {
        socket.off("new_message");
      }
    };
  }, [socket, loggedInUser.userid]);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const response = await fetch("https://chatterbox-9gu6.onrender.com/inbox", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setConversation(result);
    } catch (error) {
      console.log(`Error Here Is: ${error}`);
    }
  };
  useEffect(() => {
    fetchConversation();
  }, [conversation]);

  const getMessages = async (conversation_id, conversation_name) => {
    try {
      const response = await fetch(
        `https://chatterbox-9gu6.onrender.com/inbox/messages/${conversation_id}`,
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      // console.log("Fetched Messages:", result);

      if (!result.errors && result.data) {
        setFormVisible(true);
        const { data } = result;

        setParticipant(data.participant);
        setCurrentConversationId(conversation_id);
        setCurrentConversationName(conversation_name);

        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([]);
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
  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const sendMessages = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("message", messageText);
    if (selectedFiles) {
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
    }
    formData.append("receiverId", participant.id);
    formData.append("receiverName", participant.name);
    formData.append("receiverAvatar", participant.avatar || "");
    formData.append("conversationId", currentConversationId);
    try {
      const response = await fetch("https://chatterbox-9gu6.onrender.com/inbox/message", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();

      if (!result.error) {
        // Immediately add the message to the UI
        const newMessage = {
          id: result.data._id,
          text: messageText,
          sender: {
            id: loggedInUser.userid,
            name: loggedInUser.username,
            avatar: loggedInUser.avatar,
          },
          time: moment().fromNow(),
          attachment: result.data.attachment || [],
          isCurrentUser: true,
        };

        // Emit the socket event
        if (socket) {
          socket.emit("new_message", {
            message: {
              ...newMessage,
              conversation_id: currentConversationId,
            },
          });
        }

        // Reset the input fields
        setMessageText("");
        setSelectedFiles([]);
        scrollToBottom();
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
        `https://chatterbox-9gu6.onrender.com/inbox/messages/${participant_id}`,
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
      }
    } catch (error) {
      toast.error(error.msg);
    }
  };

  return (
    <div className="mt-16 bg-white/30 backdrop-blur-md rounded-xl drop-shadow-md h-screen w-full  flex flex-1 hover:shadow-xl ">
      <section className="relative bg-black/45 p-2 w-96 flex flex-col">
        <div className=" p-4">
          <input
            type="text"
            placeholder="Search Users"
            className="p-1 px-2 pr-3 w-56 rounded-md outline-none font-mono bg-black/10 border-b  border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white"
          />
        </div>

        <div
          className="flex justify-center"
          onClick={() => setSearchUserTabOpen(!searchUserTabOpen)}
        >
          {searchUserTabOpen ? (
            <Plus className="rotate-45  h-8 w-8 cursor-pointer hover:fill-white border-none" />
          ) : (
            <CirclePlus className="h-8 w-8 cursor-pointer hover:fill-white border-none" />
          )}
        </div>
        {searchUserTabOpen ? (
          <SearchUserTab setSearchUserTabOpen={setSearchUserTabOpen} />
        ) : (
          ""
        )}
        {conversation.length > 0 ? (
          conversation.map((conversation) =>
            loggedInUser.userid !== conversation.participant.id ? (
              <div
                key={conversation._id}
                className=" text-white/70  flex mt-2 rounded-lg bg-black/10 hover:bg-black/25 cursor-pointer transition-all shadow-md"
                onClick={() =>
                  getMessages(conversation._id, conversation.participant.name)
                }
              >
                <div className="  flex items-center p-2 rounded-lg">
                  <img
                    className="w-10 h-10 "
                    src={
                      conversation?.participant?.avatar
                        ? `https://chatterbox-9gu6.onrender.com/uploads/avatars/${conversation.participant.avatar}`
                        : "/default-avatar.png"
                    } // Safe access to avatar
                    alt={`${conversation.participant?.name || "User"}'s avatar`}
                  />
                </div>
                <div className="px-2 flex flex-col justify-center">
                  <h4>{conversation.participant?.name || "Unknown"}</h4>
                  <p>{moment(conversation.createdAt).fromNow()}</p>
                </div>
              </div>
            ) : (
              <div
                key={conversation._id}
                className=" text-white/70  flex mt-2 rounded-lg bg-black/10 hover:bg-black/25 cursor-pointer transition-all shadow-md"
                onClick={() =>
                  getMessages(conversation._id, conversation.participant.name)
                }
              >
                <div className="  flex items-center p-2 rounded-lg">
                  <img
                    className="w-10 h-10 "
                    src={
                      conversation?.creator?.avatar
                        ? `https://chatterbox-9gu6.onrender.com/uploads/avatars/${conversation.creator.avatar}`
                        : "/default-avatar.png"
                    } // Safe access to avatar
                    alt={`${conversation.creator?.name || "User"}'s avatar`}
                  />
                </div>
                <div className="px-2 flex flex-col justify-center">
                  <h4>{conversation.creator?.name || "Unknown"}</h4>
                  <p>{moment(conversation.createdAt).fromNow()}</p>
                </div>
              </div>
            )
          )
        ) : (
          <p>No conversations yet.</p>
        )}
      </section>
      <section className="relative w-full flex flex-col">
        {/* name and trashcan placeholder */}
        <div className=" flex justify-between px-5 py-4 bg-black/45">
          <div className="flex gap-1 justify-center items-center">
            {participant ? (
              <img
                src={
                  participant.avatar
                    ? `https://chatterbox-9gu6.onrender.com/uploads/avatars/${participant.avatar}`
                    : noPhoto
                }
                alt={participant?.name || "Unknown"}
                className="w-8 h-8 object-contain rounded-lg"
              />
            ) : (
              ""
            )}
            <h3 className="font-mono text-white text-lg">
              {currentConversationName || "No Conversation Selected"}
            </h3>
          </div>
          <p className="cursor-pointer">
            <button onClick={() => removeConversation(participant.id)}>
              <Trash2 className="hover:fill-red-600" />
            </button>
          </p>
        </div>
        {/* Message Container */}
        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length > 0 ? (
            // Render all messages
            messages.map((message, index) => {
              const sender = message.sender || {};
              const senderAvatar = sender.avatar
                ? `https://chatterbox-9gu6.onrender.com/uploads/avatars/${sender.avatar}`
                : `${noPhoto}`;

              const isCurrentUser = sender.id === loggedInUser.userid;
              const messageClass = isCurrentUser
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-700 text-white self-start";

              return (
                <div
                  key={message.id || index}
                  className={`flex items-end space-x-2 ${
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
                    className={`max-w-xs break-words rounded-lg px-4 py-2 ${messageClass}`}
                  >
                    {message.text}

                    {message.attachment && message.attachment.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachment.map((attachment, idx) => (
                          <img
                            key={idx}
                            src={`https://chatterbox-9gu6.onrender.com/uploads/attachments/${attachment}`}
                            alt="attachment"
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {moment(message.date_time).fromNow()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400">No messages yet</div>
          )}
        </div>

        {/* Input Section */}
        {formVisible ? (
          <form
            onSubmit={sendMessages}
            className="border-t border-gray-700 p-4 flex items-center bg-gray-900"
          >
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center">
              <button
                type="button"
                className="relative  text-gray-400 hover:text-gray-200"
              >
                <input
                  type="file"
                  multiple
                  className="absolute w-9 top-1 right-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Paperclip className=" w-9 h-9 bg-bg-gray-900 bottom-3  cursor-pointer" />
              </button>
              <input
                type="text"
                className="ml-4 flex-1 p-2 bg-gray-800 text-white rounded-lg outline-none border-none"
                placeholder="Type a message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </form>
        ) : (
          ""
        )}
      </section>
    </div>
  );
}

export default Inbox;
