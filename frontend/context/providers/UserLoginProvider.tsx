import { Provider, useSelector } from "react-redux";
import { store } from "../context";
import { useEffect } from "react";
import { login } from "../userSlice";

const UserLoginProvider = ({ children }) => {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      store.dispatch(login(user));
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
};
export default UserLoginProvider;
