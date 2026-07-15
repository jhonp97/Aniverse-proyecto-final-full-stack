"use client";

// Tarjeta de anime. Acepta tanto el formato antiguo de Jikan (`titles` array,
// `images.webp.large_image_url`) como el formato actual del backend (que mapea
// AniList a Jikan-like: `title` string, `images.jpg.large_image_url`).
// Asi si en el futuro cambia la fuente de datos no rompe el componente.

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// imagen de placeholder si la API no devuelve una
const PLACEHOLDER_IMG = "/img/avatar1.png";

const AnimeCards = ({ anime }) => {
  // leo con optional chaining para no romper si el objeto esta incompleto
  const mal_id = anime?.mal_id;
  const title = anime?.title || "Sin titulo";
  const score = anime?.score ?? null;
  const genres = Array.isArray(anime?.genres) ? anime.genres : [];
  const synopsis = anime?.synopsis || "Haz clic en 'Ver mas' para ver los detalles.";

  // intento varias rutas de imagen porque el formato cambio entre Jikan y AniList
  const imgUrl =
    anime?.images?.jpg?.large_image_url ||
    anime?.images?.webp?.large_image_url ||
    anime?.image ||
    PLACEHOLDER_IMG;

  const [isHover, setIsHover] = useState(false);

  return (
    <article className="bg-slate-800 text-gray-200  rounded-lg overflow-hidden shadow-cyan-950 hover:shadow-lg hover:scale-105 transition-transform duration-200 ">
      <div
        className="relative h-64 overflow-hidden"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Image
          src={imgUrl}
          alt={`Imagen de ${title}`}
          width={200}
          height={330}
          quality={100}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />

        {/* hover para la sinopsis */}
        <div
          className={`absolute inset-0 bg-slate-950 bg-opacity-80 flex items-center justify-center p-4 transition-opacity duration-300
          ${isHover ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <p className="text-white text-sm text-center leading-relaxed">
            {(synopsis || "Sinopsis no disponible").substring(0, 150)}...
          </p>
        </div>
      </div>
      <Link href={`/animes/${mal_id}`} className="cursor-default">
        <div className="p-2.5  flex flex-col  justify-between gap-2  h-50">
          <h3
            className={`font-bold mb-2 text-center break-words ${title.length >= 23 ? "text-sm" : "text-base sm:text-lg md:text-xl"}`}
          >
            {title}
          </h3>

          <div className="flex flex-wrap gap-1 mb-3 items-center justify-center ">
            {genres.slice(0, 4).map((gen, i) => (
              <span
                key={i}
                className={` text-white bg-purple-600 text-xs px-2 p-1 rounded-full `}
              >
                {gen?.name || ""}
              </span>
            ))}
          </div>

          <p className="text-sm text-center">
            <strong>⭐</strong>
            {score ?? "Sin calificacion"}
          </p>

          <button className=" w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:cursor-pointer text-white p-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
            Ver mas
          </button>
        </div>
      </Link>
    </article>
  );
};

export default AnimeCards;
