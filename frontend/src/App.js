import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Header from "./components/Header";
import Users from "./components/Users";
import Signup from "./components/Signup";
import Inbox from "./components/Inbox";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:4000/check-login", {
          credentials: "include", // Include cookies for authentication
        });
        if (response.ok) {
          const { loggedIn, loggedInUser } = await response.json();
          setIsLoggedIn(loggedIn); // Assumes backend sends { loggedIn: true/false }
          setLoggedInUser(loggedInUser);
        } else {
          setIsLoggedIn(false);
          setLoggedInUser(null);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
        setLoggedInUser(null);
      }
    };

    checkLoginStatus();
  }, []);
  return (
    <div
      className="min-h-screen  w-full bg-gradient-to-r from-purple-900 via-fuchsia-900 to-pink-900
 flex items-center justify-center gap-4 p-4"
    >
      <Router>
        <Header
          className="m-24"
          loggedInUser={loggedInUser}
          setLoggedInUser={setLoggedInUser}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <Inbox loggedInUser={loggedInUser} /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              !isLoggedIn ? <Signup /> : <Inbox loggedInUser={loggedInUser} />
            }
          />
          <Route
            path="/users"
            element={
              isLoggedIn ? <Users loggedInUser={loggedInUser} /> : <Login />
            }
          />
          <Route
            path="/inbox"
            element={
              isLoggedIn ? <Inbox loggedInUser={loggedInUser} /> : <Login />
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right" // Specify toast position
        autoClose={3000} // Close after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
