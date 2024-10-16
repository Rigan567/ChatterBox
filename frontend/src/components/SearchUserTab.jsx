import { SquareUserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SearchUserTab = ({ setSearchUserTabOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);

  const fetchUsers = async () => {
    if (searchQuery.length > 0) {
      try {
        const response = await fetch(
          `http://localhost:4000/inbox/search?query=${searchQuery}`,
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
      const response = await fetch("http://localhost:4000/inbox/conversation", {
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
    <div className="border p-6 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-800 rounded-lg">
      <input
        type="text"
        placeholder="Search Users"
        value={searchQuery}
        className="p-1 px-2 pr-3 w-56 rounded-md outline-none font-mono bg-white border-b  border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-black cursor-pointer"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="mt-4">
        {searchedUsers.length > 0
          ? searchedUsers.map((user) => (
              <div
                key={user._id}
                className="hover:border text-white/70 flex mt-2 rounded-lg bg-black  hover:bg-white/15 cursor-pointer transition-all shadow-md p-2"
                onClick={() =>
                  createConversation(user._id, user.name, user.avatar)
                }
              >
                {user.avatar ? (
                  <img
                    className="w-8 h-8"
                    src={`http://localhost:4000/uploads/avatars/${user.avatar}`}
                  />
                ) : (
                  <SquareUserRound className="w-8 h-8" />
                )}
                <div className="px-2">
                  <h4>{user.name}</h4>
                  <p>{user.email || user.mobile}</p>
                </div>
              </div>
            ))
          : ""}
      </div>
    </div>
  );
};

export default SearchUserTab;
