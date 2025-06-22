import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext";

const Card = ({ image }) => {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  return (
    <div
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[220px] bg-[#020220] border-2 border-[#1414acb3] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900 cursor-pointer hover:border-2 hover:border-white duration-200 ${
        selectedImage == image
          ? "border-2 border-white shadow-2xl shadow-blue-900"
          : null
      }`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img src={image} className="h-full object-cover" />
    </div>
  );
};

export default Card;
