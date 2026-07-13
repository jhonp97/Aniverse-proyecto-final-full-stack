"use client"
// mi componente para el boton de favoritos, el cual añade o quita el anime de la lista de favoritos, enviandolo a un backend y mostrandolo en la pagina de nuestro perfil

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { BsBookmarkFill, BsBookmark } from "react-icons/bs"

const BtnPriv = ({ anime }) => {
    const { user, token, fetchUserData } = useAuth()
    const [isFavorite, setIsFavorite] = useState(false)


    // verifica que el anime si esta en la lista
    useEffect(() => {
        if (user?.listaPrivada?.some(priv => priv.animeId === anime.mal_id)) {
            setIsFavorite(true)
        } else {
            setIsFavorite(false)
        }
    }, [user, anime.mal_id])
    // console.log("favoritos del usuario", user?.favoritos)

    // funcion para agregar o quitar el anime de favoritos
    const toggleFavorito = async () => {
        if (!token) {
            alert("Debes iniciar sesión para añadir a favoritos."); //mensaje de que debe estar registardo para agregar a fav
            return;
        }

        const titulo = anime.titles?.find(t => t.type === "Default")?.title || anime.title;
        const imageUrl = anime.images?.webp?.large_image_url;
        const genero = anime.genres?.[0]?.name || 'Desconocido';
        const score = anime.score || 0;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

        // aqui depende de que si el esatdo actual es true (si ya esta en favoritos) se elimina al hacer click (DELETE), y si no, lo agrego con POST
        const metodo = isFavorite ? "DELETE" : "POST";

        const ruta = isFavorite ? `${apiUrl}/listaPrivada/${anime.mal_id}`//quito el anime
            : `${apiUrl}/listaPrivada`// lo agrego
        try {
            const res = await fetch(ruta, {
                method: metodo,
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: metodo === "POST" ? JSON.stringify({
                    animeId: anime.mal_id,
                    title: titulo,
                    image: imageUrl,
                    genero: genero,
                    score: score
                }) : null,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`error al ${isFavorite ? 'eliminar' : 'añadir'} el favorito: ${errorData.msg}`)
            }
            setIsFavorite(prev => !prev) // actualizo el estado del boton
            // actualizar los datos del usuario
            if (fetchUserData) {
                await fetchUserData()
            }

        } catch (e) {
            console.error("Error al agregar a la lista Privada: ", e)
        }
        // console.log(isFavorite)
    };
   

    return (
        <button
            onClick={toggleFavorito}
            className="text-pink-700  text-3xl hover:scale-110 transition">
            {isFavorite ? <BsBookmarkFill/> : <BsBookmark />}
          
        </button>
    )


};

export default BtnPriv;