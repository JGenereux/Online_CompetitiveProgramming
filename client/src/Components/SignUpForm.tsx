import Navbar from "./Navbar";
import SignUp from "./sign-up/SignUp";

export default function SignupForm() {
    return <div className="flex flex-col">
        <Navbar />
        <SignUp />
    </div>
}