import React, { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordMatch: false,
    isLengthValid: false, 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      validatePassword(value);
    }

    if (name === "confirmPassword") {
      setPasswordErrors((prev) => ({
        ...prev,
        passwordMatch: value === data.password,
      }));
    }
  };

  const validatePassword = (password) => {
    const upperCase = /[A-Z]/.test(password);
    const number = /\d/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 8; // Check for length

    setPasswordErrors({
      hasUpperCase: upperCase,
      hasNumber: number,
      hasSpecialChar: specialChar,
      passwordMatch: password === data.confirmPassword,
      isLengthValid: isLengthValid, // Update length validation
    });
  };

  const valideValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!passwordErrors.isLengthValid) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return; // Prevent submission if length is invalid
    }

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/login");
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        <p>Bienvenido a Multiservicios AVISAI</p>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name">Nombre :</label>
            <input
              type="text"
              id="name"
              autoFocus
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email">Correo Electrónico :</label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">Contraseña :</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full outline-none"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
              />
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              <p className={`${
                passwordErrors.hasUpperCase ? "text-green-600" : "text-red-600"
              }`}>
                • Una mayúscula
              </p>
              <p className={`${
                passwordErrors.hasNumber ? "text-green-600" : "text-red-600"
              }`}>
                • Un número
              </p>
              <p className={`${
                passwordErrors.hasSpecialChar ? "text-green-600" : "text-red-600"
              }`}>
                • Un símbolo especial
              </p>
              <p className={`${
                passwordErrors.isLengthValid ? "text-green-600" : "text-red-600"
              }`}>
                • Al menos 8 caracteres
              </p>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="confirmPassword">Confirmar Contraseña :</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar tu contraseña"
              />
              <div
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            {!passwordErrors.passwordMatch && data.confirmPassword && (
              <p className="text-red-600 text-xs">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <button
            disabled={
              !valideValue ||
              !passwordErrors.hasUpperCase ||
              !passwordErrors.hasNumber ||
              !passwordErrors.hasSpecialChar ||
              !passwordErrors.passwordMatch ||
              !passwordErrors.isLengthValid // Disable if length is invalid
            }
            className={`${
              valideValue
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-gray-500"
            } text-white py-2 rounded font-semibold my-3 tracking-wide`}
          >
            Registrarse
          </button>
        </form>

        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link
            to={"/login"}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
