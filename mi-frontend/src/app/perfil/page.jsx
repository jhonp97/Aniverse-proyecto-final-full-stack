// esta es mi pagina del perfil, donde muestro los datos del usuario, sus favoritos, reseñas y amigos
// importo los componentes necesarios para la pagina
// dejo comentado el mock de datos que usaba antes de hacer el back
// para lo demas tenia varios useEffect para hacer fetch para las reseñas y amigos y como me habia quedado codigo demasiado largo
// decidi dividir el ocntenido en varios componentes, me costó un poco porque al final me hice líos con los nombres de cada cosa 
// pero despues de media tarde de mirar y probar se pudo hacer y tocó cambiar alguna cosas como:
// el usseEffect para cargar las reseñas y los amigos

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiEdit, FiCamera } from "react-icons/fi";

import Loading from "@/components/Loading";
import EditarPerfil from "@/components/EditarPerfil";
import PerfilTabs from "@/components/PerfilTabs";
import PerfilContent from "@/components/PerfilContent";


//  DATOS DE EJEMPLO (usados antes de hacer el back )
// const mockUser = {
//   username: "MiUsuario123",
//   bio: "Amante del shonen y la ciencia ficción.",
//   profilePicture: "/img/logo-eye.png",
// };

// const mockFavoritos = [{
//     mal_id: 1,
//     titles: [
//       { type: "Default", title: "Attack on Titan" },
//       { type: "Synonym", title: "Shingeki no Kyojin" }
//     ],
//     images: {
//       webp: {
//         large_image_url: "/img/shingeki.jpg"}},
//     score: 4.8,
//     genres: [{ name: "Action" }, { name: "Drama" }],
//     synopsis: "La humanidad lucha contra titanes en un mundo postapocalíptico."
//   }];
const perfil = () => {
  // const [favoritos, setFavoritos] = useState([]);
  const [reseñas, setReseñas] = useState([]);
  const [editarPerfil, setEditarPerfil] = useState(false);
  const [activeTab, setActiveTab] = useState("favoritos"); // Estado para controlar la pestaña activa
 
   const [datosAmigos, setDatosAmigos] = useState({
     amigos: [],
     solicitudes: [],
   });

  const { user, token, loading, error, fetchUserData } = useAuth();
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const rutaBackend = apiUrl.replace("/api/v1", ""); //remuevo para obtener la ruta del back y poder acceder a las imagenes que estan en la raiz
  // url para la imagen si se sube, si no usa la que es por defecto
  const fotoPerfilSrc = user?.fotoPerfil?.startsWith("/uploads") // aqui uso startsWith para verificar que la ruta empieza con /uploads
    ? `${rutaBackend}${user.fotoPerfil}`
    : user?.fotoPerfil || "/img/avatar1.png";

    useEffect(() => {
    // Si la carga inicial ha terminado y AÚN no hay usuario, lo redirigimos
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  //useEffect para cargar los datos de amigos o de reseñas cuando la pestaña esté activa
  useEffect(() => {
    const fetchDatosTab = async () => {
      if(!token) return; // si no hay token, no hago nada

      let ruta= ""
      if (activeTab === "reseñas") ruta="/reviews/my-reviews";
      if (activeTab === "amigos" ) ruta="/friends/me";
        
        if(ruta){
        try {
          const response = await fetch(`${apiUrl}${ruta}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            if (activeTab === 'reseñas') setReseñas(data);
            if (activeTab === 'amigos') setDatosAmigos(data);
           
            console.log(`mis datos de amigos son ${datosAmigos}`);
          }
        } catch (err) {
          console.error(`Error al cargar datos : ${activeTab}`, err);
        }
      }
    };
  fetchDatosTab();
  }, [activeTab, token, apiUrl]);


  // FUNCIONES PARA ACEPTAR Y RECHAZAR SOLICITUDES DE AMISTAD
  const handleAceptarSolicitud = async (usuarioQueEnvia) => {
    /*fetch a PUT /friends/accept/:usuarioQueEnvia  */
    try{
      const response= await fetch(`${apiUrl}/friends/accept/${usuarioQueEnvia}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al aceptar la solicitud");
      }
      console.log("Solicitud aceptada correctamente" );
      // actualizo los datos
      await fetchUserData()
    }catch (error) {
      console.error("Error al aceptar la solicitud:", error);
    }
  };
  const handleRechazarSolicitud = async (usuarioQueEnvia) => {
    /*fetch a PUT /friends/accept/:usuarioQueEnvia  */
    try{
      const response= await fetch(`${apiUrl}/friends/reject/${usuarioQueEnvia}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al aceptar la solicitud");
      }
      console.log("Solicitud aceptada correctamente" );
      // actualizo los datos
      await fetchUserData()
    }catch (error) {
      console.error("Error al aceptar la solicitud:", error);
    }
  };


  return (
    <section className="max-w-7xl mx-auto p-4 md:p-8 text-white">
      {/* --- BANNER DEL PERFIL --- */}
      <div className="bg-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Image
            src={fotoPerfilSrc}
            alt={`Foto de perfil de ${user?.username || "usuario"} `}
            width={128}
            height={128}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-700"
          />
          <button className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full hover:bg-cyan-600 transition-colors duration-200">
            <FiCamera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{user?.username}</h1>
          <p className="text-slate-400 mt-1">{user?.bio}</p>
          <button
            className="mt-4 flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-600 transition-colors duration-200"
            onClick={() => setEditarPerfil(true)}
          >
            <FiEdit />
            Editar Perfil
          </button>
        </div>
      </div>

      {/* --- PESTAÑAS DE NAVEGACIÓN --- */}
 <PerfilTabs activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* --- CONTENIDO DE PESTAÑA ACTIVA --- */}
      <div className="mt-6">
        <PerfilContent
          activeTab={activeTab}
          user={user}
          reseñas={reseñas}
          datosAmigos={datosAmigos}
          onAccept={handleAceptarSolicitud}
          onReject={handleRechazarSolicitud}
        />
      </div>

      {editarPerfil && (
        <EditarPerfil user={user} onClose={() => setEditarPerfil(false)} />
      )}
    </section>
  );
};

export default perfil;
