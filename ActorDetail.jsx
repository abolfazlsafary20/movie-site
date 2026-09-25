import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "./ActorDetail.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

const AWARDS = [
  "Oscar Winner",
  "Golden Globe Winner",
  "BAFTA Winner",
  "Emmy Winner",
  "Cannes Best Actor",
  "SAG Award",
  "Critics Choice Award",
  "Tony Award"
];

function getRandomAwards(actorId) {
  const seed = actorId.toString().charCodeAt(0);

  // کپی از آرایه برای جلوگیری از خراب شدن AWARDS
  const shuffled = [...AWARDS].sort(
    (a, b) => 0.5 - Math.random() + seed / 100
  );

  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
}

export default function ActorDetail() {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const actorRes = await fetch(
          `${BASE_URL}/person/${id}?api_key=${API_KEY}&language=en-US`
        );
        const actorData = await actorRes.json();
        setActor(actorData);

        const moviesRes = await fetch(
          `${BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}&language=en-US`
        );
        const moviesData = await moviesRes.json();
        setMovies(moviesData.cast || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // ✅ جایزه‌ها فقط وقتی id عوض بشه تغییر میکنن
  const randomAwards = useMemo(() => {
    return getRandomAwards(id);
  }, [id]);

  if (loading) return <p className="actor-loading-text">Loading...</p>;
  if (!actor) return <p className="actor-loading-text">Actor not found</p>;

  const upcomingMovies = movies
    .filter(movie => movie.poster_path && movie.title && movie.release_date)
    .filter(movie => new Date(movie.release_date) > new Date())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);

  const pastMovies = movies
    .filter(movie => movie.poster_path && movie.title && movie.release_date)
    .filter(movie => new Date(movie.release_date) <= new Date())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 30);

  return (
    <div className="actor-page">
      <div className="actor-header">
        <img
          src={
            actor.profile_path
              ? IMG_URL + actor.profile_path
              : "https://via.placeholder.com/300x450"
          }
          alt={actor.name}
          className="actor-profile-img"
        />

        <div className="actor-details">
          <h1 className="actor-name">{actor.name}</h1>

          <p className="actor-meta">
            <strong>Birthday:</strong> {actor.birthday || "Unknown"}
          </p>

          <p className="actor-meta">
            <strong>Place of Birth:</strong>{" "}
            {actor.place_of_birth || "Unknown"}
          </p>

          <div className="actor-awards">
            {randomAwards.map((award, i) => (
              <span key={i} className="actor-award">
                {award}
              </span>
            ))}
          </div>

          {upcomingMovies.length > 0 && (
            <div className="actor-upcoming-films">
              <h3>Upcoming Movies</h3>
              <ul>
                {upcomingMovies.map(movie => (
                  <li key={movie.id}>
                    {movie.title} ({movie.release_date.slice(0, 4)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {pastMovies.length > 0 && (
        <>
          <h2 className="actor-movie-title-section">
            Movies Played
          </h2>

          <div className="actor-movie-grid">
            {pastMovies.map(movie => (
              <Link
                key={movie.id}
                to={`/movie/movie/${movie.id}`}
                className="actor-movie-card"
              >
                <img
                  src={IMG_URL + movie.poster_path}
                  alt={movie.title}
                  className="actor-movie-poster"
                />
                <p className="actor-movie-name">
                  {movie.title}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
