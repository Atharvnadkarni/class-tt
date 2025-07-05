import { Provider } from "react-redux";
import { store } from "../context";

const UserLoginProvider = ({ children }) => {
  console.log("auth context state:",store.getState());
  return <Provider store={store}>{children}</Provider>;
};
export default UserLoginProvider;
