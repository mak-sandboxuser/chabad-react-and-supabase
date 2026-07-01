import ChabadLogo from "./ChabadLogo";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthCard({ type = "signin" }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1a2a5e]/8 border border-gray-100 p-8 w-full max-w-md mx-auto">
      {/* Logo centered */}
      <div className="flex justify-center mb-6">
        <ChabadLogo size="lg" />
      </div>

      {/* Heading */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-[#1a2a5e] mb-1">Welcome Back</h2>
        <p className="text-gray-400 text-sm">Access your Chabad Bedford Member Portal</p>
      </div>

      {console.log(type)}
      {/* Form */}
       {type === "signin" ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}
