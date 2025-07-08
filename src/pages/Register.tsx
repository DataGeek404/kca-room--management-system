
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { User } from "@/types/auth";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (user: User) => {
    // TODO: Handle successful registration
    // For now, redirect to login page
    navigate("/");
  };

  return <RegisterForm onRegister={handleRegister} />;
};

export default Register;
