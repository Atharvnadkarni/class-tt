import { login } from "@/context/userSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/context/contextHooks";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const logIn = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/teacher/login",
        {
          username,
          password,
        }
      );

      const data = response.data;

      if (typeof window !== "undefined") {
        window.localStorage.setItem("user", JSON.stringify(data));
      }
      dispatch(login(data));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err.response.data.error);
    }
  };
  return { logIn, isLoading, error };
};
