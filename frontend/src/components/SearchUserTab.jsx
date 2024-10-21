import { SquareUserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiUrl } from "../config";

const SearchUserTab = ({ setSearchUserTabOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);

  const fetchUsers = async () => {
    if (searchQuery.length > 0) {
      try {
        const response = await fetch(
          `${apiUrl}/inbox/search?query=${searchQuery}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        setSearchedUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    } else {
      setSearchedUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const createConversation = async (participant_id, name, avatar) => {
    try {
      const response = await fetch(`${apiUrl}/inbox/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant: name,
          id: participant_id,
          avatar: avatar !== "undefined" ? avatar : null,
        }),
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.exists) {
        // If conversation already exists, display a message
        toast.warning(`Conversation with ${name} already exists.`);
        setSearchUserTabOpen(false);
      } else if (response.ok && !result.exists) {
        // If a new conversation was created, add it to the conversation array
        toast.success(`New conversation created with ${name}.`);
        setSearchUserTabOpen(false);
      }
    } catch (error) {
      console.log(`Error Here: ${error}`);
      toast.error("An error occurred while creating the conversation.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-black/20 rounded-lg p-4 mb-4"
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search Users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-black/10 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {searchedUsers.length > 0
          ? searchedUsers.map((user) => (
              <motion.div
                key={user._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black/10 p-3 rounded-lg cursor-pointer hover:bg-black/20 transition-colors duration-200 flex items-center space-x-3"
                onClick={() =>
                  createConversation(user._id, user.name, user.avatar)
                }
              >
                {user.avatar ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={`${apiUrl}/uploads/avatars/${user.avatar}`}
                    alt={`${user.name}'s avatar`}
                  />
                ) : (
                  <SquareUserRound className="w-10 h-10 text-gray-400" />
                )}
                <div>
                  <h4 className="text-white font-semibold">{user.name}</h4>
                  <p className="text-gray-300 text-sm">
                    {user.email || user.mobile}
                  </p>
                </div>
              </motion.div>
            ))
          : searchQuery.length > 0 && (
              <p className="text-center text-gray-400">No users found</p>
            )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 flex items-center justify-center p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200 w-full"
        onClick={() => setSearchUserTabOpen(false)}
      >
        <X size={20} />
        <span className="ml-2">Close</span>
      </motion.button>
    </motion.div>
  );
};

export default SearchUserTab;
