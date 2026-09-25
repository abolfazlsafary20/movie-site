import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import Footer from "./Footer";
import { getMovies, getMoviesByGenre, getTV } from "./tmdb";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";

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
  const [trending, setTrending] = useState([]);

  const totalLines = 8;

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

        <Link to={`/movie/movie/${banner.id}`}>
          <button className="banner-btn">
            ▶ Watch
          </button>
        </Link>

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

  </div>
)}
{/* ================= ROWS ================= */}
{rows.map((row, i) => (
  <div key={i} className="slider-wrapper">

    <h2 className="row-title">{row.title}</h2>


    {/* فقط بخش فیلم ها */}
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


                  {item.vote_average && (
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

   {/* باکس ویژه ژانر */}
      {data[row.title]?.[i] && (
  <div className="featured-genre-box">

   <img
       src={
       data[row.title][i].backdrop_path
       ? IMG_URL + data[row.title][i].backdrop_path
       : data[row.title][i].poster_path
       ? IMG_URL + data[row.title][i].poster_path
       : "https://via.placeholder.com/1200x600"
    }
        alt={data[row.title][i].title || data[row.title][i].name}
    />

    <div className="featured-genre-overlay">

      <div className="featured-left">

  <h2>
    {data[row.title][i].title || data[row.title][i].name}
  </h2>


  <p className="featured-description">
    {data[row.title][i].overview
      ? data[row.title][i].overview.slice(0, 180) + "..."
      : "No description available"}
  </p>


  <div className="featured-meta">

    <span className="featured-rating">
      ⭐ {data[row.title][i].vote_average?.toFixed(1)}
    </span>

    <span>
    📅 {
      (
        data[row.title][i].release_date ||
        data[row.title][i].first_air_date
      )?.slice(0, 4)
       }
    </span>

  </div>

 </div>


      <div className="featured-right">
      
        <Link to={`/movie/${row.type}/${data[row.title][i].id}`}>
          <button className="featured-watch-btn">
            ▶ Watch Now
          </button>
        </Link>

      </div>

    </div>

  </div>
)}

  </div>
))}

      <Footer />
    </div>
  );
}

export default Home;