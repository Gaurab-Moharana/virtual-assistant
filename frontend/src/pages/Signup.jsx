import React, { useContext, useState } from "react";
import bg from "../assets/authBg.png";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, userData, setUserData } = useContext(userDataContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      setLoading(false);
      toast.success("Sign Up Successfull");
      navigate("/customize");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setErr(error.response.data.message);
    }
  };
  return (
    <div
      className="w-full h-[100vh] bg-cover bg-center bg-no-repeat flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] h-[600px] max-w-[450px] bg-[#00000082] backdrop-blur shadow-lg shadow-blue-950 flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignup}
      >
        <h1 className="text-white text-[30px] font-bold mb-[30px]">Register</h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full h-[50px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 rounded-full px-[20px] py-[10px] text-[17px]"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full h-[50px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 rounded-full px-[20px] py-[10px] text-[17px]"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="w-full h-[50px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full h-full outline-none  border-white bg-transparent text-white placeholder-gray-300 rounded-full px-[20px] py-[10px] text-[17px]"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!showPassword ? (
            <IoEye
              className="absolute top-[15px] right-[20px] w-[20px] h-[20px] text-[white] cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <IoEyeOff
              className="absolute top-[15px] right-[20px] w-[20px] h-[20px] text-[white] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {err.length > 0 && <p className="text-red-500 text-[16px]">*{err}</p>}
        <button
          className="w-full h-[45px] mt-[30px] bg-white text-black font-bold rounded-full cursor-pointer duration-300 text-[17px] hover:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <p className="text-[white] text-[16px]">
          Already have an account ?{" "}
          <span
            className="text-blue-500 cursor-pointer "
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
