import Tabs from "@/tabs";
import TimetableHeader from "../components/Header";
import devPic from "./atharvpic.jpeg";
import Link from "next/link";

const AboutTheDev = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TimetableHeader loggedIn={false} />
      <main className="px-4 py-8">
        {/* <Tabs activeTab={null} /> */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <img
              src="/atharvpic.jpeg"
              alt="Developer Avatar"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
            <div className="md:w-2/3 w-full md:pl-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                About the Developer
              </h2>
              <p className="text-gray-600">
                Atharv Nadkarni, aged 12, is currently studying in the 7th Std
                in Vidya Vikas Academy. He started coding at the age of 4 and
                has learned many programming languages including C, C++, Python,
                React, JavaScript, HTML, CSS, etc.
                <br />
                <br />
                For more information on Atharv, you can visit his website:
                <br />
                <Link
                  style={{ color: "red", textDecoration: "underline" }}
                  href="https://www.atharvnadkarni.com"
                >
                  www.atharvnadkarni.com
                </Link>
                
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AboutTheDev;
