import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./style.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

function MovieDetail() {
  const { id, type } = useParams();

  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [video, setVideo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [likes, setLikes] = useState(0);
  const [similar, setSimilar] = useState([]);
  const [cast, setCast] = useState([]);

  const sliderRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setMovie(data));

        fetch(`http://localhost:5000/api/titles/1/videos`)
    .then(res => res.json())
    .then(data => {
      console.log("VIDEO DATA:", data);
      if (data.success && data.data.length > 0) {
        setVideo(data.data[0]);
      }
    })
    .catch(error => {
      console.error("Video API error:", error);
    });

    fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailerData = data.results.find(
          v => v.type === "Trailer" && v.site === "YouTube"
        );
        setTrailer(trailerData);
      });

    fetch(`${BASE_URL}/${type}/${id}/reviews?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setReviews(data.results));

    fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setSimilar(data.results.slice(0, 20)));

    fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setCast(data.cast.slice(0, 10)));

  }, [id, type]);

  const scrollSlider = (distance) => {
    sliderRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const handleAddReview = () => {
    if (newReview.trim() !== "") {
      setReviews([
        { id: Date.now(), author: "You", content: newReview },
        ...reviews
      ]);
      setNewReview("");
    }
  };

  if (!movie)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  return (
    <div className="movie-detail-container">

      <div className="movie-card">
        <div className="movie-left poster-wrapper">
          <img
            src={
              movie.poster_path
                ? IMG_URL + movie.poster_path
                : "https://via.placeholder.com/300x450"
            }
            alt={movie.title || movie.name}
            className="movie-poster"
          />
        </div>

        <div className="movie-right">
          {video && (
          <video
          controls
          width="100%"
          src={video.url}
          />
          )}
          {trailer && (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
              className="trailer-frame"
            />
          )}

          <h1>{movie.title || movie.name}</h1>
          <p className="movie-overview">{movie.overview}</p>

          <button
            className="like-btn"
            onClick={() => setLikes(likes + 1)}
          >
            ❤️ Like ({likes})
          </button>
        </div>
      </div>

      {/* 🔥 Cast Section (Clickable Actors) */}
      {cast.length > 0 && (
        <div className="cast-section">
          <h2>Cast</h2>
          <div className="cast-container">
            {cast.map(actor => (
              <Link
                key={actor.id}
                to={`/actor/${actor.id}`}
                className="cast-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    actor.profile_path
                      ? IMG_URL + actor.profile_path
                      : "https://via.placeholder.com/150x200"
                  }
                  alt={actor.name}
                  className="cast-image"
                />
                <p className="cast-name">{actor.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Similar Movies */}
      <div className="detail-slider-wrapper">
        <h2 className="similar-title-header">Similar Movies</h2>

        {similar.length > 0 && (
          <>
            <button
              className="detail-arrow left"
              onClick={() => scrollSlider(-400)}
            >
              ❮
            </button>
            <button
              className="detail-arrow right"
              onClick={() => scrollSlider(400)}
            >
              ❯
            </button>
          </>
        )}

        <div className="similar-slider" ref={sliderRef}>
          {similar.length === 0 ? (
            <p className="no-similar">
              No similar movies available.
            </p>
          ) : (
            similar.map(item => (
              <Link
                key={item.id}
                to={`/movie/${type}/${item.id}`}
                className="similar-link"
              >
                <div className="similar-item">
                  <img
                    src={
                      item.poster_path
                        ? IMG_URL + item.poster_path
                        : "https://via.placeholder.com/300x450"
                    }
                    alt={item.title || item.name}
                    className="similar-poster"
                  />
                  <p className="similar-title">
                    {item.title || item.name}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2>User Reviews</h2>

        <div className="add-review">
          <textarea
            placeholder="...write your review here"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button onClick={handleAddReview}>Submit</button>
        </div>

        <div className="reviews-list">
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <p className="review-author">{review.author}</p>
              <p className="review-content">{review.content}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default MovieDetail;
