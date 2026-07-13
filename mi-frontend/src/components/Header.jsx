"use client";

// importo Link para poder navegar hacia mis rutas sin usar <a>
//el useState para abrir y cerrar el menu hamburguesa
// handleClick es para que se cierre el menu despues de      hacer click a donde vayamos a navegar
// tenia repetido dos veces mi nav con el mismo codigo entonces cree una lista de objetos la cual recorro despues con un map dandole las props para que se vea menos codigo

// PENDIENTE VOLVER AQUI CUANDO REALICE EL LOGGIN PARA CAMBIAR LOGIN Y REGISTRO POR "MI PERFIL" Y "CERRAR SESION"

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
//Iconos de react-icons perfil y cerra sesion
import { FiLogOut } from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";
import { usePathname,  useRouter } from "next/navigation";

// este el componente header de la pagina

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const [logout, setLogout] = useState(false)
  const pathname = usePathname();
  const router = useRouter()

  const {user, logout, loading} = useAuth();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const rutaBackend = apiUrl.replace("/api/v1", ""); //remuevo para obtener la ruta del back
  // url para la imagen si se sube, si no usa la que es por defecto
  const fotoPerfilSrc = user?.fotoPerfil?.startsWith("/uploads") // aqui uso startsWith para verificar que la ruta empieza con /uploads
    ? `${rutaBackend}${user.fotoPerfil}` : user?.fotoPerfil || "/img/avatar1.png";

  const handleClick = () => {setIsOpen(false);};

  // esta funcion llama al logout del contexto que limpia todo
  const handleLogout = () => {
    logout()
    console.log("se ha cerrado sesion");
    setIsOpen(false);
    router.push("/login")
  };

  // enlances siempre visibles
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/animes", label: "Animes" },
  ];

  // lo uso para simular que pueda funcionar la autenticacion cambiar esto luego al hacer el backend
  // const isAutenticado = true;
  // const user = {
  //   username: "jhon_dev",
  //   profilePicture: "/avatar1.png", // imagen de perfil 
 

  
  // funcion para los enlaces  para evitar que se repitan
  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link href="/" onClick={isMobile ? handleClick : undefined} className={`transition ${pathname === "/" ? "text-cyan-400 font-semibold  border-b-2"  : "hover:text-cyan-400"}`}>
        Inicio
      </Link>
      <Link href="/animes" onClick={isMobile ? handleClick : undefined} className={`transition ${pathname === "/animes" ? "text-cyan-400 font-semibold  border-b-2"  : "hover:text-cyan-400"}`}>
        Animes
      </Link>
{!loading && (
  <>
      {user ? (
        <>
          <Link href="/perfil" onClick={isMobile ? handleClick : undefined} className={`transition ${pathname === "/perfil" ? "text-cyan-400 font-semibold  border-b-2"  : "hover:text-cyan-400"}`}>
            Mi Perfil
          </Link>
          <button onClick={handleLogout} className="flex items-center cursor-pointer gap-2 text-red-500 hover:text-red-400 transition">
            <FiLogOut />
            <span >Cerrar sesión</span>
          </button>
        </>
      ) : (
        <>
          <Link href="/login" onClick={isMobile ? handleClick : undefined} className={`transition ${pathname === "/login" ? "text-cyan-400 font-semibold  border-b-2" : "hover:text-cyan-400"}`}>
            Login
          </Link>
          <Link href="/registro" onClick={isMobile ? handleClick : undefined} className={`transition ${pathname === "/registro" ? "text-cyan-400 font-semibold  border-b-2" : "hover:text-cyan-400"}`}>
            Registro
          </Link>
        </>
      )}
    </>
)}
</>
  );

  return (
    <header className=" sticky top-0  bg-slate-900 h-20 border-b border-slate-800 backdrop-blur-sm flex justify-between items-center  text-white p-5 md:p-6 shadow-lg z-50">
      <div className="text-2xl font-semibold">
        <Link href="/">
          {user && user.fotoPerfil ? (
            // mostrar foto de perfil cuando inicio sesion
            <Image
              src={fotoPerfilSrc}
              alt={`Foto de perfil de ${user?.username || "usuario"} `}
              width={400}
              height={400}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <Image
              src="/img/aniverse-logo-removebg-preview.png"
              alt="imagen logo de aniverse"
              width={250}
              height={250}
              className="w-40 h-auto hover:scale-110 transition"
            />
          )}
        </Link>
      </div>


        {/* mostrar enlaces dependiedno si estoy en cesion o no */}
      <nav className="hidden md:flex justify-around w-xl font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
        {!loading && <NavLinks />}
      </nav>

      {/* menu hamburguesa*/}
      <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl md:hidden z-50">
        <span className="material-icons">{isOpen ? "close" : "menu"}</span>
      </button>

      {/*menu para movil*/}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-900 flex flex-col items-center justify-center gap-8 text-2xl z-40 py-10">
           {!loading && <NavLinks isMobile={true} />}
        </div>
      )}
    </header>
  );
};
