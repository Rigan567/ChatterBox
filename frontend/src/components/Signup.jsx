import React from "react";
import { useForm } from "react-hook-form";
import { MessageSquareMore } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      let response = await fetch("http://localhost:4000/users", {
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
    <div className="mt-16 bg-white/30 backdrop-blur-md rounded-xl drop-shadow-md h-screen w-full md:w-fit flex hover:shadow-xl ">
      <section className="hidden md:block drop-shadow-xl w-3/6 bg-gradient-to-b from-fuchsia-900 to-purple-800 rounded-xl">
        <div className="w-96 h-full  flex items-center justify-center">
          <MessageSquareMore className="h-48 w-48 cursor-pointer hover:scale-125 hover:-rotate-45 hover:-translate-y-4 transition-all ease-in-out" />
        </div>
      </section>
      <section className=" pt-24 rounded-xl flex justify-center items-start">
        <form
          method="post"
          encType="multipart/form-data"
          className="space-y-4   sm:w-96 p-5 flex flex-col flex-1 flex-wrap justify-center items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full">
            <label htmlFor="Name" className="  text-lg pr-5 text-white">
              Name:
            </label>
            <br />
            <input
              className=" p-1 px-2 pr-3 w-56 rounded-md outline-none font-mono bg-black/10 border-b  border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white"
              type="text"
              {...register("name", {
                required: "Required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="mobile" className="text-lg pr-5 text-white">
              Mobile Number:
            </label>
            <br />

            <input
              className="p-1 pr-3 w-56 rounded-md outline-none  bg-black/10 font-mono border-b border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white"
              type="tel"
              {...register("mobile", {
                required: "Required",
                pattern: {
                  value: /^[0-9]{10,14}$/,
                  message: "Enter a valid mobile number (10-14 digits)",
                },
              })}
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mobile.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label htmlFor="email" className="  text-lg pr-5 text-white">
              Email:
            </label>
            <br />

            <input
              className=" p-1 pr-3 w-56 rounded-md outline-none font-mono bg-black/10 border-b  border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white"
              type="email"
              {...register("email", {
                required: "Required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="password" className=" text-lg pr-5 text-white">
              Password:
            </label>
            <br />

            <input
              type="password"
              id="password"
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
              className={`border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } p-1 rounded-md outline-none w-56 font-mono bg-black/10 border-b  border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label htmlFor="image" className="text-lg pr-5 text-white">
              Upload Profile Image:
            </label>
            <br />
            <input
              type="file"
              accept="image/*"
              className="cursor-pointer p-1 pl-2 pr-3 w-70 rounded-md outline-none bg-black/10 font-mono border-b border-white/20 shadow-md hover:border-r-2 hover:border-b-2 text-white/75"
              {...register("image")}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image.message}
              </p>
            )}
          </div>
          <div className="  w-full  py-2 flex justify-start">
            <button className="h-auto w-auto px-3 py-2 rounded-md text-white bg-gradient-to-r from-indigo-800 to-violet-600 hover:from-violet-800 hover:to-indigo-600 hover:drop-shadow-md transition-all ease-in">
              Signup
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
