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

    const response = await axios.post("http://localhost:4000/api/login", {
      username,
      password,
    });

    const data = response.data;

    if (response.status != 200) {
      setIsLoading(false);
      setError(data.error);
    }
    if (response.status > 200 && response.status < 300) {
      setIsLoading(true);
      localStorage.setItem("user", data.token);
      dispatch(login(data));
      setIsLoading(false);
    }
  };
  return { logIn, isLoading, error };
};
