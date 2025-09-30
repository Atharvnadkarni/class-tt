"use client";
import SocketProvider from "./SocketProvider";
import UserLoginProvider from "./UserLoginProvider";

const Providers = ({ children }) => {
  return (
    <UserLoginProvider>
      <SocketProvider>{children}</SocketProvider>
    </UserLoginProvider>
  );
};
export default Providers;
