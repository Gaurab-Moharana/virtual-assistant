import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const Customize2 = () => {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false);
      console.log(result.data);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#050553] flex justify-center items-center flex-col p-[20px] relative">
      <IoArrowBack
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/customize")}
      />
      <h1 className="text-white mb-[30px] text-[20px] lg:text-[30px] text-center font-bold">
        Enter your{" "}
        <span className="text-blue-400 font-bold">Assistant Name</span>
      </h1>
      <input
        type="text"
        placeholder="Enter Here..."
        className="w-full h-[50px] max-w-[600px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 rounded-full px-[20px] py-[10px] text-[17px]"
        required
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
      />
      {assistantName && (
        <button
          className="min-w-[200px] h-[50px] mt-[30px] bg-white text-black font-bold rounded-full cursor-pointer duration-300 text-[16px] hover:bg-gray-300"
          disabled={loading}
          onClick={() => {
            handleUpdateAssistant();
          }}
        >
          {!loading ? "Create Assistant" : "Loading..."}
        </button>
      )}
    </div>
  );
};

export default Customize2;
