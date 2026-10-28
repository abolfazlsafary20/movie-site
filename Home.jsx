import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import Footer from "./Footer";
import { getMovies, getMoviesByGenre, getTV } from "./tmdb";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const filterSafeContent = (items = []) => {
  return items.filter(
    (item) =>
      item?.poster_path &&
      item?.adult === false
  );
};

function Home() {
  const rows = useMemo(() => [
    { title: "Action Movies", type: "movie", genre: 28 },
    { title: "Horror Movies", type: "movie", genre: 27 },
    { title: "Crime Movies", type: "movie", genre: 80 },
    { title: "Sci-Fi Movies", type: "movie", genre: 878 },
    { title: "Mystery & Thriller", type: "movie", genre: 9648 },
    { title: "Comedy Movies", type: "movie", genre: 35 },
    { title: "Family Movies", type: "movie", genre: 10751 },

    { title: "Popular Series", type: "tv", category: "popular" },
    { title: "Top Rated Series", type: "tv", category: "top_rated" },
  ], []);

  const rowRefs = useRef([]);
  const [data, setData] = useState({});
  const [featuredIndices, setFeaturedIndices] = useState({});
  const [trending, setTrending] = useState([]);

  const totalLines = isMobile ? 6 : 8;

  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerTimer, setBannerTimer] = useState(0);

  const [preloadedImages, setPreloadedImages] = useState({});

  const bannerCount = trending.length;
  const banner = trending.length
  ? trending[bannerIndex % trending.length]
  : null;

  // ================= FETCH =================
  useEffect(() => {
    const loadData = async () => {
      try {
        const resultData = {};

        for (let row of rows) {
          let res = null;

          if (row.genre) {
            res = await getMoviesByGenre(row.genre);
          } else if (row.type === "tv") {
            if (row.category === "top_rated") {
              const response = await fetch(
                `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US`
              );
              res = await response.json();
            } else if (row.category === "popular") {
              const response = await fetch(
                `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US`
              );
              res = await response.json();
            } else {
              res = await getTV();
            }
          } else {
            const response = await fetch(
              `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`
            );
            res = await response.json();
          }

          resultData[row.title] = filterSafeContent(res?.results || []);
        }

        setData(resultData);

       const trendingRes = await fetch(
       `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`
         );
         const trendingJson = await trendingRes.json();

        setTrending(
        filterSafeContent(trendingJson.results || []).slice(0, 16)
        );
        } catch (err) {
        console.error("API Error:", err);
}
};

loadData();
}, []);

  // ================= BANNER TIMER =================

useEffect(() => {
  if (bannerCount <= 1) return;

  const interval = setInterval(() => {
    setBannerTimer((prev) => {
      if (prev >= 4900) {
        setBannerIndex(
          (current) => (current + 1) % bannerCount
        );
        return 0;
      }

      return prev + 100;
    });
  }, 100);

  return () => clearInterval(interval);
}, [bannerCount]);

  // ================= PRELOAD IMAGE =================
useEffect(() => {
  if (!trending.length) return;

  trending.forEach((item) => {
    const img = new Image();
    img.src = IMG_URL + item.backdrop_path;

    img.onload = () => {
      setPreloadedImages((prev) => ({
        ...prev,
        [item.id]: true,
      }));
    };
  });
}, [trending]);
  // ================= SCROLL =================
  const moveLeft = (i) =>
    rowRefs.current[i]?.scrollBy({ left: -300, behavior: "smooth" });

  const moveRight = (i) =>
    rowRefs.current[i]?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <div className="home mobile-page">

      {/* ================= BANNER ================= */}
{banner && (
  <div className="header-banner">

    <img
      key={banner.id}
      src={
        banner.backdrop_path
          ? IMG_URL + banner.backdrop_path
          : "https://via.placeholder.com/1280x720"
      }
      alt={banner.title || banner.name}
    />

    
<div className="banner-overlay">
  <div className="banner-content">

    <h2 className="banner-title">
      {banner.title || banner.name}
    </h2>

   
<div className="banner-meta">
  <span className="banner-rating">
    <span className="rating-star">★</span>
    {banner.vote_average?.toFixed(1) || "N/A"}
  </span>
  <span className="banner-meta-divider"></span>

  <span className="banner-year">
    {(banner.release_date || banner.first_air_date || "").slice(0, 4)}
  </span>

  <span className="banner-meta-divider"></span>

  {banner.genre_ids?.slice(0, 3).map((genreId) => {
    const genres = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      18: "Drama",
      14: "Fantasy",
      27: "Horror",
      878: "Sci-Fi",
      53: "Thriller",
      10749: "Romance",
      9648: "Mystery",
      10751: "Family",
      36: "History",
      10752: "War",
      37: "Western",
      99: "Documentary",
      10402: "Music",
      10770: "TV Movie",
    };

    return genres[genreId] ? (
     <span className="banner-genre" key={genreId}>
       {genres[genreId]}
     </span>
    ) : null;
  })}
</div>

    <p className="banner-description">
      {banner.overview
        ? banner.overview.length > 190
          ? banner.overview.slice(0, 190).trimEnd() + "..."
          : banner.overview
        : "Discover your next favorite movie."}
    </p>

    <div className="banner-actions">
      <Link to={`/movie/movie/${banner.id}`}>
        
    <button className="banner-btn">
    <span className="banner-play-icon">▶</span>
    <span>Watch Now</span>
    </button>

    </Link>
    </div>

  </div>
</div>

        {/* PROGRESS */}
    <div className="banner-progress">
      {Array.from({ length: totalLines }).map((_, i) => {
        const activeLine = bannerIndex % totalLines;

        return (
          <div key={i} className="banner-progress-bar">
            <div
              className="banner-progress-bar-inner"
              style={{
                width:
                  i === activeLine
                    ? `${(bannerTimer / 5000) * 100}%`
                    : "0%",
              }}
            />
          </div>
        );
      })}
    </div>

    {/* MAIN BANNER ARROWS */}
    {bannerCount > 1 && (
      <>
        <button
          type="button"
          className="main-banner-arrow main-banner-arrow-left"
          aria-label="Previous movie"
          onClick={() => {
            setBannerIndex(
              (prev) => (prev - 1 + bannerCount) % bannerCount
            );
            setBannerTimer(0);
          }}
        >
          ❮
        </button>

        <button
          type="button"
          className="main-banner-arrow main-banner-arrow-right"
          aria-label="Next movie"
          onClick={() => {
            setBannerIndex((prev) => (prev + 1) % bannerCount);
            setBannerTimer(0);
          }}
        >
          ❯
        </button>
      </>
    )}

  </div>
)}
{/* ================= ROWS ================= */}
{rows.map((row, i) => (
  <div key={i} className="slider-wrapper">

    <h2 className="row-title">{row.title}</h2>


    <div className="categories-section">

      <button 
        className="arrow left" 
        onClick={() => moveLeft(i)} 
      />

      <button 
        className="arrow right" 
        onClick={() => moveRight(i)} 
      />


      <div
        className="categories-wrapper"
        ref={(el) => (rowRefs.current[i] = el)}
      >

        <div className="categories">

          {data[row.title]?.map((item) => (

            <div key={item.id} className="category-wrapper">

              <Link to={`/movie/${row.type}/${item.id}`}>

                <div className="category-column poster-wrapper">

                  <img
                    src={
                      item.poster_path
                        ? IMG_URL + item.poster_path
                        : "https://via.placeholder.com/300x450"
                    }
                    alt={item.title || item.name}
                    className="category-poster"
                  />


                  {item.vote_average > 0 && (
                  <span className="browse-item-vote">
                   ⭐ {item.vote_average.toFixed(1)}
                  </span>
                  )}

                </div>

              </Link>


              <p className="category-title">
                {item.title || item.name}
              </p>


            </div>

          ))}

        </div>

      </div>

    </div>

     
{data[row.title]?.length > 0 && (() => {
  const featuredItems = data[row.title];
  const featuredIndex =
    (featuredIndices[row.title] ?? i) % featuredItems.length;
  const featuredItem = featuredItems[featuredIndex];

  const changeFeatured = (direction) => {
    setFeaturedIndices((prev) => ({
      ...prev,
      [row.title]:
        (featuredIndex + direction + featuredItems.length) %
        featuredItems.length,
    }));
  };

  return (
    <div className="featured-genre-box">
      <img
        src={
          featuredItem.backdrop_path
            ? IMG_URL + featuredItem.backdrop_path
            : IMG_URL + featuredItem.poster_path
        }
        alt={featuredItem.title || featuredItem.name}
      />

      <div className="featured-genre-overlay">
        <div className="featured-left">
          <h2>{featuredItem.title || featuredItem.name}</h2>

          <p className="featured-description">
            {featuredItem.overview
              ? featuredItem.overview.slice(0, 180) + "..."
              : "No description available"}
          </p>

          <div className="featured-meta">
            <span className="featured-rating">
              ⭐ {featuredItem.vote_average?.toFixed(1)}
            </span>

            <span>
              📅{" "}
              {(
                featuredItem.release_date ||
                featuredItem.first_air_date ||
                ""
              ).slice(0, 4)}
            </span>
          </div>
        </div>

        <div className="featured-right">
          <Link to={`/movie/${row.type}/${featuredItem.id}`}>
            <button className="featured-watch-btn">
              ▶ Watch Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
})()}

  </div>
))}

      <Footer />
    </div>
  );
}

export default Home;