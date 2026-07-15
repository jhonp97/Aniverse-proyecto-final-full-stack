"use client";

/** Este componente trae datos desde el backend que a su vez trae datos desde la API de jikan
 * muestro los animes y con los filtros establecidos los ordeno segun lo requiera
 * realizo el control de errores y la animacion de carga
 * luego muestro los componentes de AnimeCards, FiltroAnimes y BtnPaginacion
 */

import AnimeCards from "@/components/AnimeCards";
import FiltroAnimes from "@/components/FiltroAnimes";
import BtnPaginacion from "@/components/BtnPaginacion";
import Loading from "@/components/Loading";

import { useState, useEffect } from "react";

const Animes = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const [filtro, setFiltro] = useState("all")

  const [filtro, setFiltro] = useState({
    name: "", // nombre del anime
    status: "", //  estado, ej: completado
    genres: "", // número de género
    order_by: "popularity", // arrancamos con "popularity" para que el /animes muestre contenido distinto del home (que es top score)
    sort: "desc", // orden descendente
  });


  // este useEffect se ejecuta cuando la pagina cambia o se cambian los filtros
  useEffect(() => {
    const traerAnimes = async () => {
      try {
       
        setError(null);

         const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const params = new URLSearchParams({
          page: page, // Añadimos la página por defecto
        });

        // Este bloque añade dinámicamente todos los filtros que no estén vacíos
        Object.entries(filtro).forEach(([key, value]) => {
          if (value) {
            // si 'value' no es una cadena vacía, null o undefined
            const paramKey = key === "name" ? "q" : key; // la api de Jikan usa "q" para el nombre
            params.append(paramKey, value);
          }
        });
       
       // peticion al back 
        const response = await fetch(
          `${apiUrl}/jikan/animes?${params.toString()}`
        );

        if (!response.ok) {
          // Intento leer el mensaje del backend, pero si no se puede, muestro el status
          let msg = `Error ${response.status}`;
          try {
            const errBody = await response.json();
            if (errBody && errBody.msg) msg = errBody.msg;
          } catch (_) {
            // el backend no devolvio JSON, dejo el mensaje por status
          }
          throw new Error(msg);
        }
        const data = await response.json();

        // guardo los animes y las paginas disponibles
        setAnimes(data.data || []);
        setTotalPages(data.pagination?.last_visible_page ?? 1);

      } catch (error) {
        console.error(`No se pudo cargar el archivo, error:`, error);
        setError(error.message);
      } finally {
        setLoading(false); // finaliza el estado de carga
      }
    };

    traerAnimes();
  }, [page, filtro]);

  /** esta funcion se encarga de aplicar nuevos filtros y reiniciar la pagina 
   * a la numero 1, para evitar errores de paginacion
   *  */
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setPage(1);
  };

  // const cards = animes.map((a) => <AnimeCards key={animes.mal_id} anime={animes} />);

  const cards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 p-3">
      {animes.map((anime) => (
        <AnimeCards key={anime.mal_id} anime={anime} />
      ))}
    </div>
  );

  return (
    <section className="flez flex-col items-center justify-center">
      <h2 className="font-bold text-sm md:text-2xl xl:text-5xl text-center text-white p-5 m-3">Animes</h2>

      <FiltroAnimes filtro={filtro} setFiltro={handleFiltroChange} />

      <section className="max-w-7xl mx-auto p-3 w-full">
        {loading ? <Loading/>: cards}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </section>
      <BtnPaginacion
        paginaActual={page}
        totalPaginas={totalPages}
        cambiarPagina={setPage}
      />
    </section>
  );
};

export default Animes;
