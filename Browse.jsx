import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Browse.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// 🎯 فیلتر حرفه‌ای فیلم‌های اکران‌شده
const MOVIE_FILTERS =
  "&vote_count.gte=200" +
  "&vote_average.gte=6" +
  "&without_genres=99,10402,10770" +
  "&primary_release_date.gte=2000-01-01";

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const filter = params.get("filter");
  const searchQuery = params.get("query");

  useEffect(() => {
    const fetchAllPages = async () => {
      setLoading(true);

      let baseUrl = "";
      let isSearch = false;

      // ================= SEARCH MODE =================
      if (searchQuery) {
        baseUrl = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${searchQuery}`;
        isSearch = true;
      } else {
        // ================= FILTER MODE =================
        switch (filter) {
          case "latest":
            baseUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=release_date.desc${MOVIE_FILTERS}`;
            break;

          case "popular":
            baseUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc${MOVIE_FILTERS}`;
            break;

          case "top-rated":
            baseUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc${MOVIE_FILTERS}`;
            break;

          case "upcoming": {
            const today = new Date().toISOString().split("T")[0];
            baseUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${today}&without_genres=99,10402,10770`;
            break;
          }

          case "series":
            baseUrl = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=2000-01-01&vote_count.gte=100`;
            break;

          default:
            baseUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US${MOVIE_FILTERS}`;
        }
      }

      const allResults = [];

      try {
        // ⚡ کمتر کردن فشار API (قبلاً 10 بود)
        for (let page = 1; page <= 5; page++) {
          const res = await fetch(`${baseUrl}&page=${page}`);
          const data = await res.json();

          if (!data.results || data.results.length === 0) break;

          const filtered = data.results.filter((item) => {
            if (!item.poster_path) return false;

            // جلوگیری از person در search
            if (isSearch && item.media_type === "person") return false;

            // فقط movie و tv
            if (
              item.media_type &&
              item.media_type !== "movie" &&
              item.media_type !== "tv"
            ) {
              return false;
            }

            return true;
          });

          allResults.push(...filtered);
        }

        setItems(allResults);
      } catch (err) {
        console.error("Browse fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPages();
  }, [filter, searchQuery]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  // ================= EMPTY STATE =================
  if (!loading && items.length === 0) {
    return (
      <div className="browse-container">
        <h2 className="browse-title">No results found</h2>
      </div>
    );
  }

  return (
    <div className="browse-container">
      <h2 className="browse-title">
        {searchQuery
          ? `SEARCH: ${searchQuery.toUpperCase()}`
          : (filter || "latest").replace("-", " ").toUpperCase()}
      </h2>

      <div className="browse-grid">
        {items.map((item) => {
          const type =
            filter === "series"
              ? "tv"
              : item.media_type === "tv"
              ? "tv"
              : "movie";

          const title = item.title || item.name || "Untitled";
          const releaseYear =
            (item.release_date || item.first_air_date || "").slice(0, 4);

          const voteAverage = item.vote_average
            ? item.vote_average.toFixed(1)
            : "N/A";

          return (
            <Link
              key={`${type}-${item.id}`}
              to={`/movie/${type}/${item.id}`}
              className="browse-item"
            >
              <div className="browse-item-poster-wrapper">
                {item.poster_path && (
                  <img
                    src={IMG_URL + item.poster_path}
                    alt={title}
                    className="browse-item-poster"
                  />
                )}

                <div className="browse-item-overlay">
                  <span className="browse-item-year">{releaseYear}</span>
                  <span className="browse-item-vote">
                    {voteAverage} ⭐
                  </span>
                </div>
              </div>

              <p className="browse-item-title">{title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}