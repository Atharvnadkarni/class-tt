import { login } from "@/context/userSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
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

      localStorage.setItem("user", data.token);
      dispatch(login(data));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err.response.data.error);
    }
  };
  return { logIn, isLoading, error };
};
