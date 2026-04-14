import axios from "axios";

const API_KEY = "684e09d046145f8cf75fc181d5ea405a"; // Updated with valid API key
const BASE_URL = "https://api.themoviedb.org/3";

//  Trending
export const fetchTrendingMovies = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Trending TV
export const fetchTrendingTV = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Popular
export const fetchPopularMovies = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Popular TV
export const fetchPopularTV = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Top rated
export const fetchTopRatedMovies = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Top rated TV
export const fetchTopRatedTV = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Upcoming (Recommended)
export const fetchUpcomingMovies = async (page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`
  );
  return res.data.results;
};

//  Credits (cast)
export const fetchMovieCast = async (movieId: number) => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
  );
  return res.data.cast || [];
};

//  TV Credits (cast)
export const fetchTVCast = async (tvId: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`
  );
  return res.data.cast || [];
};

// ℹ Movie Details
export const fetchMovieDetails = async (movieId: number) => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  return res.data;
};

//  TV Show Details
export const fetchTVDetails = async (tvId: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`
  );
  return res.data;
};

//  External IDs (IMDb, etc.)
export const fetchExternalIds = async (movieId: number) => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}/external_ids?api_key=${API_KEY}`
  );
  return res.data;
};

//  TV External IDs
export const fetchTVExternalIds = async (tvId: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}/external_ids?api_key=${API_KEY}`
  );
  return res.data;
};

//  Search
export const searchMovies = async (query: string, page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  return res.data.results;
};

//  Search TV
export const searchTV = async (query: string, page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  return res.data.results;
};

//  Multi Search (Movies & TV)
export const multiSearch = async (query: string, page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  return res.data.results;
};

//  Genres
export const fetchGenres = async () => {
  const res = await axios.get(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
  );
  return res.data.genres;
};

//  Discover by Genre
export const fetchMoviesByGenre = async (genreId: number, page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
  );
  return res.data.results;
};

//  Discover TV by Genre
export const fetchTVByGenre = async (genreId: number, page: number = 1) => {
  const res = await axios.get(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
  );
  return res.data.results;
};

//  Videos (Trailers, Teasers)
export const fetchMovieVideos = async (movieId: number) => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  return res.data.results || [];
};

//  TV Videos
export const fetchTVVideos = async (tvId: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`
  );
  return res.data.results || [];
};

//  Similar Movies
export const fetchSimilarMovies = async (movieId: number) => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`
  );
  return res.data.results || [];
};

//  Similar TV
export const fetchSimilarTV = async (tvId: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}/similar?api_key=${API_KEY}`
  );
  return res.data.results || [];
};

//  TV Seasons
export const fetchTVSeasons = async (tvId: number, seasonNumber: number) => {
  const res = await axios.get(
    `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  return res.data;
};