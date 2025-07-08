
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { User } from "@/types/auth";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (user: User) => {
    // After successful registration, redirect to dashboard
    navigate("/");
  };

  return <RegisterForm onRegister={handleRegister} />;
};

export default Register;
