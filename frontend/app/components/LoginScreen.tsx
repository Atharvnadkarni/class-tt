"use client";

import type React from "react";

import { useState } from "react";
import { Book, CircleUser, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import TimetableHeader from "./Header";
import Link from "next/link";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLogin } from "../hooks/useLogin";
import VVA from "../../images/vva.jpeg";
import { useAppSelector, useAppDispatch } from "@/context/contextHooks";

export default function LoginScreen({ sessionExpired }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { logIn, isLoading, error } = useLogin();
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logIn(username, password);
  };
  let backgroundOpacity = 0.3;

  return user ? (
    typeof window !== "undefined" ? (
      router.push(
        `/${window.localStorage.getItem("currentTab") ?? "timetable"}` ||
          "/timetable"
      )
    ) : null
  ) : (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundImage: `url(${VVA.src})`, backgroundSize: "cover" }}
    >
      <TimetableHeader loggedIn={false} />
      {sessionExpired && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <span className="font-bold">Session expired:</span> Please log in
          again.
        </div>
      )}
      {/* Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-primary rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary">Teacher Login</h2>
            <p className="text-gray-200 mt-2">
              Enter your username to access your timetable
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary-700 text-primary font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Log in</span>
                </>
              )}
            </button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>

          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact your school administrator
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Admin access: Use "admin" as teacher number
            </p>
          </div> */}
        </div>
        <div className="mt-8">
          <div>
            <button
              className="px-4 py-2 bg-primary text-white hover:bg-primary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              onClick={() => router.push("/about-the-dev")}
            >
              <CircleUser className="w-4 h-4" />
              About the developer
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            © 2025 Atharv Nadkarni. All rights reserved.{" "}
            <Link
              style={{ color: "red", textDecoration: "underline" }}
              href="/t-and-c"
            >
              <span className="bg-red">Terms & Conditions</span>
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
