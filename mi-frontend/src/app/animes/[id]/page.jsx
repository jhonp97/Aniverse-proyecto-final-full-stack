"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation"
import FavoritoBtn from "@/components/FavoritoBtn.jsx"
import BtnPriv from "@/components/BtnPriv";
import Image from "next/image";
import ComentBox from "@/components/ComentBox";
import Hero from "@/components/Hero";
import Loading from "@/components/Loading";
import Link from "next/link";
import { FaPlay } from "react-icons/fa"; //icono de play


// Detalle de un anime.
// Antes fetcheaba directo a Jikan, pero Jikan esta caido en endpoints puntuales
// cuando se hacen muchas requests. Ahora uso AniList GraphQL directo desde el browser
// (permite CORS) y mapeo la respuesta al mismo formato Jikan-like que usa el resto
// de la UI (images.jpg.large_image_url, genres como objetos, aired.string, etc).
const ANILIST_URL = "https://graphql.anilist.co";

const ANILIST_STATUS = {
  RELEASING: "Currently Airing",
  FINISHED: "Finished Airing",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "On Hiatus",
};

const ANILIST_FORMAT = {
  TV: "TV", MOVIE: "Movie", OVA: "OVA", ONA: "ONA", SPECIAL: "Special", MUSIC: "Music",
};

function formatStartDate(d) {
  if (!d || !d.year) return "Desconocida";
  const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = d.month ? meses[d.month - 1] : "?";
  const day = d.day || "?";
  return `${m} ${day}, ${d.year}`;
}

function anilistADetail(item) {
  return {
    mal_id: item.idMal || item.id,
    title: item.title.english || item.title.romaji || "Sin titulo",
    images: {
      jpg: {
        large_image_url: item.coverImage.large,
        image_url: item.coverImage.large,
      },
    },
    score: item.averageScore ? item.averageScore / 10 : null,
    genres: (item.genres || []).map((g) => ({ name: g })),
    episodes: item.episodes || null,
    type: ANILIST_FORMAT[item.format] || item.format || "Desconocido",
    status: ANILIST_STATUS[item.status] || item.status || "Desconocido",
    aired: { string: formatStartDate(item.startDate) },
    synopsis: item.description || "Sin sinopsis disponible.",
    url: item.idMal ? `https://myanimelist.net/anime/${item.idMal}` : null,
    trailer: { embed_url: null, images: { maximum_image_url: null } }, // AniList no expone trailer embed
  };
}

export default function AnimeDetail() {
  // obtengo el ID del anime desde la url
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        // El `id` que viene en la URL es el MAL ID (no el AniList ID).
        // Usamos el filtro `idMal` de AniList para buscar por MAL ID.
        const query = `
          query ($idMal: Int) {
            Media(idMal: $idMal, type: ANIME) {
              id idMal
              title { romaji english }
              coverImage { large }
              averageScore
              genres
              episodes
              status
              format
              startDate { year month day }
              description(asHtml: false)
            }
          }
        `;
        const res = await fetch(ANILIST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ query, variables: { idMal: parseInt(id, 10) } }),
        });
        const json = await res.json();
        if (json.errors || !json.data?.Media) {
          setError("No se encontro el anime.");
        } else {
          setAnime(anilistADetail(json.data.Media));
        }
      } catch (err) {
        setError("No se pudo cargar el anime.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error || !anime) {
    return (
      <section className="p-10 text-center text-white bg-red-800">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white m-0 p-0">
      {/* Hero */}
      <Hero
        imageSrc={
          anime.trailer?.images?.maximum_image_url ||
          anime.images?.jpg?.large_image_url
        }
        title={anime.title}
        subtitle={`${anime.type || ""} — ${anime.status || ""}`}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna izquierda: Info del anime */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <Image
                src={anime.images?.jpg?.large_image_url || "/img/avatar1.png"}
                alt={anime.title || "anime"}
                width={300}
                height={450}
                quality={100}
                className="rounded-lg shadow-lg object-cover w-full md:w-64 h-100"
              />

              <div className="flex-1 ">
                <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(anime.genres || []).map((genre, i) => (
                    <span
                      key={i}
                      className="bg-purple-600 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
                  <p><strong>Tipo:</strong> {anime.type}</p>
                  <p><strong>Episodios:</strong> {anime.episodes || "?"}</p>
                  <p><strong>Estado:</strong> {anime.status}</p>
                  <p><strong>Fecha:</strong> {anime.aired?.string || "?"}</p>
                  <p><strong>Calificación:</strong> ⭐ {anime.score ?? "No disponible"}</p>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  {(anime.synopsis || "Sin sinopsis")
                    ?.split('.')
                    .slice(0, 5)
                    .join('.') + '.'}
                </p>

                {/* boton para ver en MAL */}
                {anime.url && (
                  <Link
                    href={anime.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 mr-4 inline-flex items-center gap-2 bg-cyan-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-cyan-700 transition-colors duration-300"
                  >
                    <FaPlay />
                    Ver en MyAnimeList
                  </Link>
                )}

                {/* BOTONES DE ACCION */}
                <div className="flex gap-4 mt-4">
                  <div className="bg-gray-700 p-2 rounded-lg inline-flex items-center">
                    <FavoritoBtn anime={anime} />
                  </div>
                  <div className="bg-gray-700 p-2 rounded-lg inline-flex items-center" title="Añadir a Lista Privada">
                    <BtnPriv anime={anime}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  Trailer (AniList no expone trailer embed, queda el slot vacio por ahora) */}
          <div>
            {anime.trailer?.embed_url && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Tráiler</h3>
                <div className="aspect-video rounded overflow-hidden">
                  <iframe
                    src={`${anime.trailer.embed_url}?autoplay=0`}
                    title={`Tráiler de ${anime.title}`}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de comentarios */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-8">Reseñas</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <ComentBox anime={anime} />
          </div>
        </div>
      </div>
    </div>
  );
}
