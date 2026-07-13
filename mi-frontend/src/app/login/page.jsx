"use client";

/**Este componente se encarga de manejar el inicio de sesión de los
 *  usuarios, gestionando el estado del formulario, el proceso de autenticación,
 *  y la visualización de errores o el estado de carga 
 * */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi"; // iconos de mostrar/ocultar contraseña

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verContraseña, setVerContraseña] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  //funcion para los campos del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  //funcion para manejar el evento de envio por defecto del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      // aqui envio los datos del login al backend
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("datos del login", data);
      if (!response.ok) {
        throw new Error(data.msg, "error al iniciar sesion");
      }
      //guardo el usuario y su token y  luego lo mando a la pagina de perfil
      login(data.data, data.data.token);
      console.log("sesion iniciada ", data.data);
      router.push("/perfil");

    } catch (err) {
      setError(err.message, "error al iniciar sesion");
      console.error("Error al iniciar sesión:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="min-w-screen min-h-screen  p-6 flex flex-col items-center justify-center  text-white ">
      <h3 className="text-2xl font-semibold text-center mb-4">
        Iniciar sesión
      </h3>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md m-8 p-7 border rounded-lg shadow-lg flex flex-col gap-8 bg-slate-800"
      >
        {/* para mostrar por si hay algun error */}
        {error && (
          <p className="bg-red-500 text-center text-white p-3 rounded ">
            Error al iniciar sesión
          </p>
        )}

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-medium">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ejemplo@gmail.com"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>

        <div className="flex flex-col relative">
          <label htmlFor="password" className="mb-1 font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type={verContraseña ? "text" : "password"} //para que cambie el tipo si damos click*
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            onChange={handleChange}
            value={formData.password}
            required
          />

          {/* boton para ver contraseña */}
          <button
            type="button"
            onClick={() => setVerContraseña(!verContraseña)}
            className="absolute inset-y-12 right-0 px-3 flex justify-center items-center text-slate-400 hover:text-cyan-400"
          >
            {verContraseña ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
};

export default Login;
