import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MessageSquareMore } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();
      console.log(result);
      reset();
      console.log("Login successful");
      window.location.reload();
      navigate("/inbox");
    } catch (error) {
      console.error("Error:", error);
      setLoginError(error.message);
    }
  };

  return (
    <div className="mt-16 bg-white/30 backdrop-blur-md rounded-xl drop-shadow-md h-screen w-full md:w-fit flex hover:shadow-xl">
      <section className="hidden md:block drop-shadow-xl w-3/6 bg-gradient-to-b from-fuchsia-900 to-purple-800 rounded-xl">
        <div className="w-96 h-full flex items-center justify-center">
          <MessageSquareMore className="h-48 w-48 cursor-pointer hover:scale-125 hover:-rotate-45 hover:-translate-y-4 transition-all ease-in-out" />
        </div>
      </section>
      <section className="pt-24 rounded-xl flex justify-center items-center">
        <form
          className="space-y-4 sm:w-96 p-5 flex flex-col flex-1 flex-wrap justify-center items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full">
            <label htmlFor="username" className="text-lg pr-5 text-white">
              Email/Mobile no:
            </label>
            <br />
            <input
              id="username"
              className="ml-0 p-1 pr-3 w-full rounded-md outline-none font-serif"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="password" className="text-lg pr-5 text-white">
              Password:
            </label>
            <br />
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
              })}
              className={`border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } p-1 rounded-md outline-none w-full`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {loginError && (
            <p className="text-red-500 text-sm mt-1">{loginError}</p>
          )}
          <div className="w-full px-0 py-2">
            <button className="h-auto px-3 py-2 rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-400 hover:from-green-700 hover:to-emerald-600 ease-in-out">
              Login
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
