import React from "react";
import { useForm } from "react-hook-form";
import { MessageSquareMore, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config";

export default function Signup() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields
    formData.append("name", data.name);
    formData.append("mobile", data.mobile);
    formData.append("email", data.email);
    formData.append("password", data.password);

    // Append file if it exists
    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      let response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result = await response.json();
      console.log("success!!!", result);
      reset();
      navigate("/inbox");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-800 p-4">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-b from-fuchsia-900 to-purple-800 p-12 flex items-center justify-center">
          <MessageSquareMore className="text-white h-32 w-32 md:h-48 md:w-48 transition-all duration-300 ease-in-out transform hover:scale-110 hover:-rotate-12" />
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Name:
              </label>
              <input
                id="name"
                className="w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Mobile Number:
              </label>
              <input
                id="mobile"
                className="w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your mobile number"
                {...register("mobile", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10,14}$/,
                    message: "Enter a valid mobile number (10-14 digits)",
                  },
                })}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.mobile.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email:
              </label>
              <input
                id="email"
                className="w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 bg-white/20 border border-gray-300 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message: "Password must contain letters and numbers",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Upload Profile Image:
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        {...register("image")}
                      />
                    </label>
                    <p className="pl-1 text-white">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
