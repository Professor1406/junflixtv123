require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Home Route
app.get('/', async (req, res) => {
  try {
    const movies = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
    res.render('index', { movies: movies.data.results });
  } catch (error) {
    res.send('Error fetching data');
  }
});

// Category Route
app.get('/category/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const data = await axios.get(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}`);
    res.render('category', { items: data.data.results, type });
  } catch (error) {
    res.send('Error fetching data');
  }
});

// Details Route
app.get('/details/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const details = await axios.get(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`);
    res.render('details', { item: details.data });
  } catch (error) {
    res.send('Error fetching data');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
