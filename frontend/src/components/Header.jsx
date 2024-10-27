import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, X, Menu } from "lucide-react";
import { apiUrl } from "../config";
import { toast } from "react-toastify";

export default function Header({ loggedInUser, setIsLoggedIn, isLoggedIn }) {
  const navigate = useNavigate();
  const [eclipseOn, setEclipseOn] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsLoggedIn(false);
        navigate("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const removeUser = async (userid) => {
    try {
      const deleteResponse = await fetch(`${apiUrl}/users/${userid}`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleLogout();

      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
      }
    } catch (error) {
      console.error("Error during account removal or logout:", error.message);
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
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-md shadow-sm z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-gradient-to-tl from-violet-700 to-blue-600">
              {isLoggedIn && loggedInUser ? (
                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={
                      loggedInUser.avatar
                        ? `${apiUrl}/uploads/avatars/${loggedInUser.avatar}`
                        : "/placeholder.svg?height=32&width=32"
                    }
                    alt={loggedInUser.username}
                  />
                  <p className="text-white text-sm font-medium">
                    {loggedInUser.username}
                  </p>
                </div>
              ) : (
                <p className="text-white text-sm font-medium">Not logged in</p>
              )}
            </div>
          </div>

          <nav className="hidden md:flex space-x-4">
            {navItems.map((item, index) => (
              <button
                key={index}
                className="text-white hover:text-gray-300 transition-colors duration-200"
                onClick={() => handleNavigation(item)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {loggedInUser && (
            <button
              onClick={() => setEclipseOn(!eclipseOn)}
              className="hidden md:block text-white focus:outline-none"
            >
              <EllipsisVertical className="h-6 w-6" />
            </button>
          )}
        </div>

        {mobileMenuOpen && (
          <nav className="mt-4 space-y-2">
            {navItems.map((item, index) => (
              <button
                key={index}
                className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-200 py-2"
                onClick={() => handleNavigation(item)}
              >
                {item}
              </button>
            ))}
            {loggedInUser && (
              <button
                className="block w-full text-left text-white hover:text-gray-300 transition-colors duration-200 py-2"
                onClick={handleRemoveClick}
              >
                Remove Account
              </button>
            )}
          </nav>
        )}
      </div>

      {eclipseOn && (
        <div
          className="absolute right-4 top-16 mt-2 p-2 rounded-lg bg-gradient-to-r from-fuchsia-800 to-pink-800 hover:from-fuchsia-900 hover:to-pink-900 transition-all duration-200 cursor-pointer"
          onClick={handleRemoveClick}
        >
          <p className="text-white text-sm">Remove Account</p>
        </div>
      )}

      {showWarning && (
        <WarningTab
          message="This will remove your account with all your conversations, messages, and attachments. Do you still want to continue?"
          handleConfirm={handleConfirm}
        />
      )}
    </header>
  );
}

const WarningTab = ({ message, handleConfirm }) => {
  return (
    <div className="fixed h-screen inset-0 bg-black/60 w-full flex items-center justify-center ">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-4">{message}</h3>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
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
