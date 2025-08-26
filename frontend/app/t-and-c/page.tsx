import Tabs from "@/tabs";
import TimetableHeader from "../components/Header";
import devPic from "./atharvpic.jpeg";
import Link from "next/link";

const Tnc = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="md:w-2/3 w-full text-center md:text-left">
              <h2
                className="text-2xl font-bold text-gray-800 mb-1"
              >
                Terms and Conditions
              </h2>
              <p className="text-gray-600">
                <ol>
                  <li className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Purpose of the App
                    </h2>
                    This app is created by Atharv Nadkarni to help school
                    teachers to set up the time table with ease.
                  </li>
                  <li className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Acceptable Use
                    </h2>
                    Users must use the app responsibly and respectfully. The app
                    may not be used to share inappropriate content, harass
                    others, or for any purpose unrelated to its intent. Users
                    should not attempt to modify, copy, or distribute the app
                    without the creator’s permission.
                  </li>
                  <li className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Recognition of the Creator
                    </h2>
                    The creator, Atharv Nadkarni, must be acknowledged in any
                    use, presentation, sharing of the app with others. If the
                    app is shared with other teachers, the creator’s name and
                    contribution must be clearly credited. Any adaptation or
                    further development of the app should also include
                    appropriate recognition of the original creator.
                  </li>
                  <li className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Privacy and Data
                    </h2>
                    The app does not collect, store, or share personal data.
                    Users are responsible for keeping their login information
                    secure.
                  </li>
                  <li className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Changes and Feedback
                    </h2>
                    Any suggestions or requests for changes should be
                    communicated to the creator at <Link href="mailto:atharvmnadkarni@gmail.com"><span>atharvmnadkarni@gmail.com</span></Link>.
                  </li>
                  The creator reserves the right to update the app and its
                  policy as needed. By using this app, you agree to follow these
                  guidelines and respect the creator’s intentions.
                </ol>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Tnc;
