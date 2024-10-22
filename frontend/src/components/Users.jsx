import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config";

function Users({ loggedInUser }) {
  const [users, setUsers] = useState([]);
  const fetchedUsers = async () => {
    try {
      const signedUpUsers = await fetch(`${apiUrl}/users`, {
        credentials: "include", // Ensure cookies are sent for auth
      });

      // Check if the response is OK (status in the range 200–299)
      if (!signedUpUsers.ok) {
        throw new Error(`HTTP error! status: ${signedUpUsers.status}`);
      }

      const res = await signedUpUsers.json();

      // Check if the response is an array, else fallback to an empty array
      if (Array.isArray(res)) {
        setUsers(res);
      } else {
        console.error("Unexpected response format:", res);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set an empty array to avoid breaking map()
    }
  };

  useEffect(() => {
    fetchedUsers();
  }, [users]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Manage Users
      </h2>
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/40 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.length > 0 ? (
                users.map((item) => (
                  <tr
                    key={item._id}
                    className="text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`${apiUrl}/uploads/avatars/${item.avatar}`}
                            alt={`${item.name}'s avatar`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {loggedInUser.userid === item._id
                          ? "Admin"
                          : item.role || "User"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-white">
                    No users found. Or You need to{" "}
                    <Link
                      to="/signup"
                      className="text-blue-400 hover:underline"
                    >
                      Signup
                    </Link>{" "}
                    first to see the Users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;
