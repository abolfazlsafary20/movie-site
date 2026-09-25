import React, { useState, useEffect, useRef } from "react";
import { FaHome } from "react-icons/fa";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";

import "./style.css";
import "./mobile.css";
import Home from "./Home.jsx";
import Browse from "./Browse.jsx";
import MovieDetail from "./MovieDetail.jsx";
import ActorDetail from "./ActorDetail.jsx";
import AuthModal from "./AuthModal.jsx";
import Dashboard from "./Dashboard.jsx";
const allowedGenres = [
  28, // Action
  12, // Adventure
  16, // Animation
  35, // Comedy
  80, // Crime
  18, // Drama
  14, // Fantasy
  27, // Horror
  53, // Thriller
  878 // Sci-Fi
];

import {
  FaSearch,
  FaUser,
  FaMoon,
  FaSun,
  FaBars,
  FaUserCircle,
  FaTimes,
  FaCrown
} from "react-icons/fa";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w200";

// ======================= Page Loader =======================
function PageLoader({ show }) {
  if (!show) return null;
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

// ======================= Rating Circle =======================
function RatingCircle({ vote }) {
  const size = 38;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (vote / 10) * circumference;
  const offset = circumference - progress;

  return (
    <div className="meta-rating">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFD700"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <span className="rating-number">{vote.toFixed(1)}</span>
    </div>
  );
}

// ======================= App Content =======================
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [overlaySearchTerm, setOverlaySearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEnglishWarning, setShowEnglishWarning] = useState(false);
  const [showNoResultMessage, setShowNoResultMessage] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const showResults =
  !searchLoading &&
  searchResults.length > 0 &&
  debouncedSearch.trim().length > 0;

  const menuRef = useRef(null);

  const [hideHeader, setHideHeader] = useState(false);
const lastScroll = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll.current && currentScroll > 80) {
      setHideHeader(true);
    } else {
      setHideHeader(false);
    }

    lastScroll.current = currentScroll;
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  // ===== بستن منو با کلیک بیرون + ESC =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [location]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

 useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(overlaySearchTerm);
  }, 500);

  return () => clearTimeout(timer);
  }, [overlaySearchTerm]);

  useEffect(() => {
  if (menuOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [menuOpen]);
  // ======================= SEARCH =======================
 useEffect(() => {
  if (!debouncedSearch?.trim()) {
    setSearchResults([]);
    setShowNoResultMessage(false);
    setSearchLoading(false);
    return;
  }

  const fetchSearch = async () => {
    try {
      setSearchLoading(true);

      const res = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${debouncedSearch}&include_adult=false&language=en-US`
      );

      const json = await res.json();

      const filteredResults = (json.results || []).filter((movie) => {
        return (
          movie.poster_path &&
          movie.adult === false &&
          movie.vote_count >= 200 &&
          movie.vote_average >= 6 &&
          movie.genre_ids?.some((id) => allowedGenres.includes(id))
        );
      });

      setSearchResults(filteredResults);

      setShowNoResultMessage(filteredResults.length === 0);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
      setShowNoResultMessage(true);
    } finally {
      setSearchLoading(false);
    }
  };

  fetchSearch();
}, [debouncedSearch]);
  // ===== Header click handler for Browse =====
  const handleHeaderClick = (type) => {
    navigate(`/browse?filter=${type.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <PageLoader show={loading} />

      {showEnglishWarning && (
        <div className="english-warning">Please type in English only</div>
      )}

      <header className="header desktop-header">
  {/* LEFT */}
  <div className="header-left">

    <div className="profile-menu-wrapper" ref={menuRef}>
      <button
        className="header-btn menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FaBars />
      </button>

      <div className={`profile-dropdown ${menuOpen ? "open" : ""}`}>

        <button onClick={() => navigate("/dashboard?tab=profile")}>
          <FaUserCircle /> Profile
        </button>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
          <span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button onClick={() => navigate("/dashboard?tab=subscription")}>
          <FaCrown /> Subscription
        </button>

      </div>
    </div>


 <button
  className="header-btn auth-btn"
  onClick={() => setAuthOpen(true)}
  >
  <FaUser />
  <span>Login</span>
  </button>

  </div>

  {/* CENTER */}
  <div className="header-center">

    <Link to="/" className="logo">
      <FaHome className="logo-icon" />
    </Link>


    <nav className="nav-menu">

      <span className="nav-link" onClick={() => handleHeaderClick("Latest")}>
        Latest
      </span>

      <span className="nav-link" onClick={() => handleHeaderClick("Popular")}>
        Popular
      </span>

      <span className="nav-link" onClick={() => handleHeaderClick("Top Rated")}>
        Top Rated
      </span>

      <span className="nav-link" onClick={() => handleHeaderClick("Series")}>
        Series
      </span>

      <span className="nav-link" onClick={() => handleHeaderClick("Upcoming")}>
        Upcoming
      </span>

    </nav>

  </div>



  {/* RIGHT */}
  <div className="header-right">

    <div 
      className="search-bar"
      onClick={() => setOverlayOpen(true)}
    >

      <input 
        type="text"
        placeholder="Search movies..."
        readOnly
      />

      <FaSearch className="search-icon"/>

    </div>

  </div>


</header>

<header className={`header mobile-header ${hideHeader ? "hide-header" : ""}`}>

  <button
    className="header-btn menu-btn"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <FaBars />
  </button>


  <button
    className="header-btn auth-btn"
    onClick={() => setAuthOpen(true)}
  >
    <FaUser />
    <span>Login</span>
  </button>


  <div 
  className="mobile-search"
  onClick={() => setOverlayOpen(true)}
>
  <FaSearch className="search-icon" />
</div>

</header>

<div className={`side-menu ${menuOpen ? "open" : ""}`}>

  <button onClick={() => navigate("/dashboard?tab=profile")}>
    <FaUserCircle /> Profile
  </button>

  <button onClick={() => setDarkMode(!darkMode)}>
    {darkMode ? <FaSun /> : <FaMoon />}
    <span>
      {darkMode ? "Light Mode" : "Dark Mode"}
    </span>
  </button>

  <button onClick={() => navigate("/dashboard?tab=subscription")}>
    <FaCrown /> Subscription
  </button>


  <div className="menu-divider"></div>


  <button onClick={() => navigate("/")}>
    🏠 Home
  </button>

  <button onClick={() => handleHeaderClick("Latest")}>
    🔥 Latest
  </button>

  <button onClick={() => handleHeaderClick("Popular")}>
    ⭐ Popular
  </button>

  <button onClick={() => handleHeaderClick("Top Rated")}>
    🎬 Top Rated
  </button>

  <button onClick={() => handleHeaderClick("Series")}>
    📺 Series
  </button>

  <button onClick={() => handleHeaderClick("Upcoming")}>
    🎥 Upcoming
  </button>

</div>


      {/* ===== SEARCH OVERLAY ===== */}
      <div
       className={`search-overlay ${overlayOpen ? "open" : ""}`}
       onClick={() => setOverlayOpen(false)}
      >
       <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
    
      <button
       className="overlay-close-btn"
       onClick={() => setOverlayOpen(false)}
      >
      {searchLoading ? (
        <span className="loader-circle"></span>
      ) : (
        <FaTimes />
      )}
    </button>

          <input
            type="text"
            placeholder="Search movies..."
            value={overlaySearchTerm}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setOverlaySearchTerm("");
                return;
              }

              const isEnglish = /^[A-Za-z0-9\s]+$/.test(value);

              if (!isEnglish) {
                setShowEnglishWarning(true);
                setTimeout(() => setShowEnglishWarning(false), 2000);
                return;
              }

              setOverlaySearchTerm(value);
            }}
            autoFocus
          />

          {showResults && (
            <div className="search-results">
              {searchResults.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/movie/${movie.id}`}
                  className="search-item-link"
                  onClick={() => setOverlayOpen(false)}
                >
                  <div className="search-item">
                    <img src={IMG_URL + movie.poster_path} alt={movie.title} />
                    <div className="movie-info">
                      <p className="movie-title">{movie.title}</p>
                      <div className="movie-meta">
                        {movie.release_date && (
                          <span className="meta-year">
                            {movie.release_date.slice(0, 4)}
                          </span>
                        )}
                        <RatingCircle vote={movie.vote_average} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {showNoResultMessage && (
            <div className="no-result-overlay-message">No movie found</div>
          )}
        </div>
      </div>

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} /> 
          <Route path="/movie/:type/:id" element={<MovieDetail />} />
          <Route path="/actor/:id" element={<ActorDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
