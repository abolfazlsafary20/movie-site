
import React, { useState, useEffect, useRef } from "react";
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

import {
  FaHome,
  FaSearch,
  FaUser,
  FaRegUser,
  FaMoon,
  FaSun,
  FaBars,
  FaUserCircle,
  FaTimes,
  FaCrown,
  FaBookmark,
} from "react-icons/fa";

const allowedGenres = [
  28, 12, 16, 35, 80, 18, 14, 27, 53, 878,
];

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w200";

// ======================= Page Loader =======================
function PageLoader({ show }) {
  if (!show) return null;

  return (
    <div className="page-loader">
      <div className="loader">
        <div />
        <div />
        <div />
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

      <span className="rating-number">
        {Number(vote || 0).toFixed(1)}
      </span>
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [showEnglishWarning, setShowEnglishWarning] = useState(false);
  const [showNoResultMessage, setShowNoResultMessage] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hideHeader, setHideHeader] = useState(false);

  const profileRef = useRef(null);
  const lastScroll = useRef(0);

  const showResults =
    !searchLoading &&
    searchResults.length > 0 &&
    debouncedSearch.trim().length > 0;

  // ======================= Header Scroll =======================
useEffect(() => {
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    const previousScroll = lastScroll.current;
    const scrollDifference = currentScroll - previousScroll;

    if (currentScroll <= 80) {
      setHideHeader(false);
    } else if (scrollDifference < -2) {
    
      setHideHeader(false);
    } else if (scrollDifference > 2) {
    
      setHideHeader(true);
    }

    lastScroll.current = currentScroll;
  };

  lastScroll.current = window.scrollY;

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  // ======================= Close Profile Dropdown =======================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
        setOverlayOpen(false);
        setAuthOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ======================= Page Loading =======================
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // ======================= Close Menus On Navigation =======================
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setOverlayOpen(false);
  }, [location.pathname, location.search]);

  // ======================= Dark Mode =======================
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");

    if (saved === "true") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // ======================= Lock Scroll When Menu Is Open =======================
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ======================= Search Debounce =======================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(overlaySearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [overlaySearchTerm]);

  // ======================= Search API =======================
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setShowNoResultMessage(false);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSearch = async () => {
      try {
        setSearchLoading(true);

        const params = new URLSearchParams({
          api_key: API_KEY || "",
          query: debouncedSearch,
          include_adult: "false",
          language: "en-US",
        });

        const response = await fetch(
          `${BASE_URL}/search/movie?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Search request failed: ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        const filteredResults = (data.results || []).filter(
          (movie) =>
            movie.poster_path &&
            movie.adult === false &&
            movie.vote_count >= 200 &&
            movie.vote_average >= 6 &&
            movie.genre_ids?.some((id) =>
              allowedGenres.includes(id)
            )
        );

        setSearchResults(filteredResults);
        setShowNoResultMessage(filteredResults.length === 0);
      } catch (error) {
        if (cancelled) return;

        console.error("Search error:", error);
        setSearchResults([]);
        setShowNoResultMessage(true);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    fetchSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  // ======================= Navigation =======================
  const handleHeaderClick = (type) => {
    navigate(
      `/browse?filter=${type.toLowerCase().replace(/\s+/g, "-")}`
    );
  };

  // ======================= Search Input =======================
  const handleSearchChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setOverlaySearchTerm("");
      setShowEnglishWarning(false);
      return;
    }

    const isEnglish = /^[A-Za-z0-9\s]+$/.test(value);

    if (!isEnglish) {
      setShowEnglishWarning(true);

      setTimeout(() => {
        setShowEnglishWarning(false);
      }, 2000);

      return;
    }

    setShowEnglishWarning(false);
    setOverlaySearchTerm(value);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <PageLoader show={loading} />

      {showEnglishWarning && (
        <div className="english-warning">
          Please type in English only
        </div>
      )}

{/* ======================= Desktop Header ======================= */}
<header
  className={`header desktop-header ${hideHeader ? "header-hidden" : ""}`}
>
  <div className="header-left">
    {/* Hamburger Menu */}
    <div className="profile-menu-wrapper" ref={profileRef}>
      <button
        type="button"
        className="header-btn menu-btn"
        aria-label="Open profile menu"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((open) => !open)}
      >
        <FaBars />
      </button>

      <div
        className={`profile-dropdown ${
          profileOpen ? "open" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setProfileOpen(false);
            navigate("/dashboard?tab=profile");
          }}
        >
          <FaUserCircle />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileOpen(false);
            navigate("/dashboard?tab=subscription");
          }}
        >
          <FaCrown />
          <span>Subscription</span>
        </button>
      </div>
    </div>

    {/* Filmexa Logo */}
    <Link to="/" className="logo" aria-label="Filmexa Home">
      <img src="/filmexa-logo.png" alt="Filmexa" />
    </Link>

    {/* Navigation Menu */}
    <nav className="nav-menu">
      <Link to="/" className="nav-link">
        Home
      </Link>

      {["Latest", "Popular", "Top Rated", "Series", "Upcoming"].map(
        (item) => (
          <span
            key={item}
            className="nav-link"
            onClick={() => handleHeaderClick(item)}
          >
            {item}
          </span>
        )
      )}
    </nav>
  </div>

  <div className="header-right">

    <div
      className="search-bar"
      onClick={() => setOverlayOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          setOverlayOpen(true);
        }
      }}
    >
      <input
        type="text"
        placeholder="Search movies..."
        readOnly
        tabIndex={-1}
      />

      <FaSearch className="search-icon" />
    </div>

    <button
      type="button"
      className="header-btn darkmode-btn"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDarkMode((mode) => !mode)}
    >
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>

    <button
      type="button"
      className="header-btn auth-btn"
      onClick={() => setAuthOpen(true)}
    >
      <FaUser />
      <span>Login</span>
    </button>

  </div>

</header>
           
      {/* ======================= Mobile Header ======================= */}

      <header className="header mobile-header">

        <button
          type="button"
          className="header-btn menu-btn"
          aria-label="Open side menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <FaBars />
        </button>

        <Link to="/" className="mobile-logo" aria-label="Filmexa Home">
          <img src="/filmexa-logo.png" alt="Filmexa" />
        </Link>
        
        <button
        type="button"
        className="header-btn mobile-search"
        aria-label="Search movies"
        onClick={() => setOverlayOpen(true)}
        >
        <FaSearch className="search-icon" />
        </button>

        <button
        type="button"
        className="header-btn auth-btn"
        onClick={() => setAuthOpen(true)}
        >
        <FaUser />
        <span>Login</span>
        </button>
      </header>

      {/* ======================= Side Menu + Overlay ======================= */}
      {menuOpen && (
        <>
          <div
            className="menu-overlay"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <aside className="side-menu open" aria-label="Main menu">
            <button
              type="button"
              onClick={() => navigate("/dashboard?tab=profile")}
            >
              <FaUserCircle />
              Profile
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((mode) => !mode)}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
              <span>
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard?tab=subscription")
              }
            >
              <FaCrown />
              Subscription
            </button>

            <div className="menu-divider" />

            <button type="button" onClick={() => navigate("/")}>
              🏠 Home
            </button>

            <button
              type="button"
              onClick={() => handleHeaderClick("Latest")}
            >
              🔥 Latest
            </button>

            <button
              type="button"
              onClick={() => handleHeaderClick("Popular")}
            >
              ⭐ Popular
            </button>

            <button
              type="button"
              onClick={() => handleHeaderClick("Top Rated")}
            >
              🎬 Top Rated
            </button>

            <button
              type="button"
              onClick={() => handleHeaderClick("Series")}
            >
              📺 Series
            </button>

            <button
              type="button"
              onClick={() => handleHeaderClick("Upcoming")}
            >
              🎥 Upcoming
            </button>
          </aside>
        </>
      )}

      {/* ======================= Search Overlay ======================= */}
      {overlayOpen && (
        <div
          className="search-overlay open"
          onClick={() => setOverlayOpen(false)}
        >
          <div
            className="overlay-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close-btn"
              onClick={() => setOverlayOpen(false)}
              aria-label="Close search"
            >
              {searchLoading ? (
                <span className="loader-circle" />
              ) : (
                <FaTimes />
              )}
            </button>

            <input
              type="text"
              placeholder="Search movies..."
              value={overlaySearchTerm}
              onChange={handleSearchChange}
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
                      <img
                        src={IMG_URL + movie.poster_path}
                        alt={movie.title}
                      />

                      <div className="movie-info">
                        <p className="movie-title">
                          {movie.title}
                        </p>

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
              <div className="no-result-overlay-message">
                No movie found
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* ======================= Page Content ======================= */}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/movie/:type/:id" element={<MovieDetail />} />
          <Route path="/actor/:id" element={<ActorDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

      {/* ======================= Auth Modal ======================= */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
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