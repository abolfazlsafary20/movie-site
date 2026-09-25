// src/api/tmdb.js

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const cache = {};

async function fetchFromAPI(url) {
  if (cache[url]) return cache[url];

  const res = await fetch(url);
  const data = await res.json();

  cache[url] = data;
  return data;
}

// Movies
export const getMovies = (type = "popular", page = 1) => {
  const url = `${BASE_URL}/movie/${type}?api_key=${API_KEY}&page=${page}`;
  return fetchFromAPI(url);
};

// Genre
export const getMoviesByGenre = (genreId, page = 1) => {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`;
  return fetchFromAPI(url);
};

// Search
export const searchMovies = (query, page = 1) => {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`;
  return fetchFromAPI(url);
};

// TV
export const getTV = (page = 1) => {
  const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`;
  return fetchFromAPI(url);
};