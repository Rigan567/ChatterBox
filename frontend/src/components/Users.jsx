import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Users({ loggedInUser }) {
  const [users, setUsers] = useState([]);
  const fetchedUsers = async () => {
    try {
      const signedUpUsers = await fetch("http://localhost:4000/users", {
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
    <div className="mt-16 min-h-screen w-full md:w-2/3 bg-white/10 rounded-2xl">
      <h2 className="text-center text-white text-2xl font-semibold mb-5">
        {" "}
        Manage Users
      </h2>
      <table className=" w-full ">
        <thead className="bg-black/40 text-white w-screen ">
          <tr>
            <th>Name</th>
            <th>Email</th>
            {/* <th>Manage</th> */}
            <th>Role</th>
          </tr>
        </thead>
        <tbody className="text-white font-normal">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((item, index) => (
              <tr
                key={item._id}
                className="cursor-pointer text-center bg-black/15 hover:bg-gradient-to-br hover:from-pink-800/60 hover:to-fuchsia-700 hover:border-b transition-all"
              >
                <td className="py-2 flex justify-center">
                  <div className="w-full flex items-center">
                    <div className="px-1">
                      <img
                        src={`http://localhost:4000/uploads/avatars/${item.avatar}`}
                        className="z-10 w-8 h-8 object-cover rounded-full"
                        alt={`${item.name}'s avatar`}
                      />
                    </div>
                    <div className="pl-2">
                      <p>{item.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2">{item.email}</td>

                <td>
                  {/* If the logged-in user's ID matches, show "admin" */}
                  {loggedInUser.userid === item._id
                    ? "Admin"
                    : item.role || "User"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-2">
                No users found. Or You need to{" "}
                <Link
                  className="text-blue-400 font-semibold border-b "
                  to={"/signup"}
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
  );
}

export default Users;
