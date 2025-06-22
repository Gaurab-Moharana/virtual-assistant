import React from "react";
import { useContext } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/login");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error:", error);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;

      setTimeout(() => {
        startRecognition();
      }, 800);
    };
    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google_search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "calculator_open") {
      window.open(`https://www.google.com/search?q=calculator`, "_blank");
    }

    if (type === "instagram_open") {
      window.open(`https://www.instagram.com/`, "_blank");
    }

    if (type === "facebook_open") {
      window.open(`https://www.facebook.com/`, "_blank");
    }

    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, "_blank");
    }
    if (type === "youtube_open") {
      window.open(`https://www.youtube.com/`, "_blank");
    }

    if (type === "youtube_search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    const safeRecognition = null;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);

      if (assistantStarted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (assistantStarted) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if (e.name !== "InvalidStateError") {
                console.error(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition Error: ", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (
        event.error !== "aborted" &&
        assistantStarted &&
        !isSpeakingRef.current
      ) {
        setTimeout(() => {
          if (assistantStarted) {
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if (e.name !== "InvalidStateError") {
                console.log(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        let data = await getGeminiResponse(transcript);
        if (!data || !data.response) {
          console.error("Invalid response from getGeminiResponse:", data);
          return;
        }

        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    return () => {
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  const startAssistant = () => {
    setAssistantStarted(true);
    const greeting = new SpeechSynthesisUtterance(
      `Hello ${userData.name}, what can I help you with?`
    );
    greeting.lang = "hi-IN";

    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) greeting.voice = hindiVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(greeting);
    startRecognition(); // Starts speech recognition
  };

  const stopAssistant = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setListening(false);
    isRecognizingRef.current = false;
    setAssistantStarted(false);
    setAiText("");
    setUserText("");
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#050553] flex justify-center items-center flex-col gap-[13px] overflow-hidden">
      <CgMenuRight
        className="lg:hidden text-white absolute  top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />
      <div
        className={`fixed inset-0   lg:hidden  bg-[#00000070] backdrop-blur-lg p-[20px] flex flex-col items-end gap-[20px]
           
          ${
            ham ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
      >
        <RxCross2
          className=" text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />

        <button
          className="w-full  mt-[200px]  bg-white text-black font-bold rounded-full cursor-pointer duration-300 text-[16px] px-6 py-3 hover:bg-gray-300 shadow-lg"
          onClick={() => navigate("/customize")}
        >
          Customize
        </button>

        <button
          className="w-full  mt-[8px]  bg-white text-black font-bold rounded-full cursor-pointer duration-300 text-[16px]  hover:bg-gray-300  px-6 py-3   shadow-lg"
          onClick={handleLogout}
        >
          Logout
        </button>

        {assistantStarted ? (
          <button
            onClick={stopAssistant}
            className="lg:hidden w-full text-[16px] bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg mt-4 hover:bg-red-500"
          >
            Stop Assistant
          </button>
        ) : null}
      </div>

      <button
        className="min-w-[240px] h-[50px] mt-[20px] bg-white text-black font-bold rounded-full cursor-pointer duration-300 hidden lg:block text-[16px] absolute top-[100px] right-[20px] px-[20px] py-[10px] hover:bg-gray-300"
        onClick={() => navigate("/customize")}
      >
        Customize
      </button>

      <button
        className="min-w-[240px] h-[50px] mt-[20px] bg-white text-black font-bold rounded-full cursor-pointer duration-300 hidden lg:block text-[16px] absolute top-[20px] right-[20px] hover:bg-gray-300"
        onClick={handleLogout}
      >
        Logout
      </button>

      {!assistantStarted ? (
        <button
          onClick={() => {
            setAssistantStarted(true);
            startAssistant(); // triggers greeting and recognition
          }}
          className="min-w-[240px] h-[50px] mt-[20px] bg-white text-black font-bold rounded-full cursor-pointer duration-300 hidden lg:block text-[16px] absolute top-[180px] right-[20px] px-[20px] py-[10px] hover:bg-gray-300 "
        >
          Start Assistant
        </button>
      ) : (
        <>
          <button
            onClick={stopAssistant}
            className="min-w-[240px] h-[50px] mt-[20px] bg-red-600 text-white font-bold rounded-full cursor-pointer duration-300 hidden lg:block text-[16px] absolute top-[180px] right-[20px] px-[20px] py-[10px] hover:bg-red-500"
          >
            Stop Assistant
          </button>
        </>
      )}

      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>

      {!assistantStarted ? (
        <button
          onClick={() => {
            setAssistantStarted(true);
            startAssistant(); // triggers greeting and recognition
          }}
          className="lg:hidden w-[230px] bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg mt-4 hover:bg-gray-200 "
        >
          Start Assistant
        </button>
      ) : null}

      {!aiText && assistantStarted ? (
        <img src={userImg} alt="" className="w-[200px]" />
      ) : (
        <>
          {aiText && assistantStarted ? (
            <img src={aiImg} alt="" className="w-[200px]" />
          ) : null}
        </>
      )}
      <h1 className="text-white text-[18px] font-semibold text-wrap">
        {userText && assistantStarted
          ? userText
          : aiText && assistantStarted
          ? aiText
          : null}
      </h1>
    </div>
  );
};

export default Home;
