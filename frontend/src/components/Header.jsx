import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";

export default function Header({ loggedInUser, setIsLoggedIn, isLoggedIn }) {
  const navigate = useNavigate();
  const [eclipseOn, setEclipseOn] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are included
      });
      if (response.ok) {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const removeUser = async (userid) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${userid}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await handleLogout();
      //  const result = response.json();
    } catch (error) {
      throw new Error("Fetching error:", error.message);
    }
  };

  const handleRemoveClick = () => {
    setEclipseOn(false);
    setShowWarning(true); // Show warning tab when "Remove Account" is clicked
  };

  const handleConfirm = (confirm) => {
    if (confirm) {
      removeUser(loggedInUser.userid); // Proceed with account removal if confirmed
    }
    setShowWarning(false);
  };

  const navItems = [
    "Inbox",
    "Users",
    "Signup",
    isLoggedIn ? "Logout" : "Login",
  ];

  const handleNavigation = (item) => {
    if (item === "Logout") {
      handleLogout();
    } else if (item === "Login") {
      navigate("/");
    } else {
      navigate(`/${item.toLowerCase()}`);
    }
  };

  return (
    <div
      id="header"
      className="fixed min-h-18 mb-56 top-0 left-0 right-0 bg-black/20 backdrop-blur-md shadow-sm  z-10"
    >
      <div className=" relative container mx-auto px-4 py-1 flex justify-around items-center gap-5">
        <div className="p-2 rounded-lg bg-gradient-to-tl from-violet-700 to-blue-600">
          {isLoggedIn && loggedInUser ? (
            <div className="flex gap-1 w-fit h-fit items-center">
              <img
                className="border rounded-lg h-9 object-cover"
                src={
                  loggedInUser.avatar
                    ? `http://localhost:4000/uploads/avatars/${loggedInUser.avatar}`
                    : null
                }
                alt=""
              />
              <p className="text-white">{` ${loggedInUser.username}`}</p>
            </div>
          ) : (
            <p className="text-white">Not logged in</p>
          )}
        </div>
        <nav className="flex space-x-4 text-white">
          {navItems.map((item, index) => (
            <button
              className="border-b border-b-transparent hover:border-b-white hover:scale-105 transition-all ease-out"
              key={index}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        {loggedInUser ? (
          <button onClick={() => setEclipseOn(!eclipseOn)}>
            <EllipsisVertical className="text-white size-icon" />
          </button>
        ) : (
          ""
        )}
        {eclipseOn ? (
          <aside
            className={`${
              eclipseOn ? "translate-y-0" : "translate-y-2"
            } border cursor-pointer absolute right-12 top-12 mt-2 mr-7 p-2 rounded-lg bg-gradient-to-r from-fuchsia-800 to-pink-800 hover:from-fuchsia-900 hover:to-pink-900 hover:drop-shadow-md transition-transform`}
            onClick={handleRemoveClick}
          >
            {loggedInUser ? (
              <p className="text-white">{`Remove Account of ${loggedInUser.username}`}</p>
            ) : (
              ""
            )}
          </aside>
        ) : null}
      </div>
      {/* Warning Tab for confirmation */}
      {showWarning && (
        <WarningTab
          message="This will remove your account with all your conversations, messages, and attachments. Do you still want to continue?"
          handleConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

const WarningTab = ({ message, handleConfirm }) => {
  return (
    <div className="fixed border h-screen inset-0 bg-black/60 w-full flex items-center justify-center ">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        {" "}
        <h3 className="text-lg font-semibold mb-4">{message}</h3>
        <div className="flex justify-between gap-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
            onClick={() => handleConfirm(true)} // Call handleConfirm with 'true' to proceed
          >
            Yes, Remove
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg"
            onClick={() => handleConfirm(false)} // Call handleConfirm with 'false' to cancel
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
