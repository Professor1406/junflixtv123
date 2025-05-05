const TMDB_API = "648c004c97b5a1425c702528ab88ddac";
const TRAKT_API = "ac546c48d4785be512b307374e9dfff78041ed94f344a121d7cff31b3447c296";
const IMDB_API = {
    url: 'https://imdb8.p.rapidapi.com/auto-complete?q=game%20of%20thr',
    options: {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '1fe6cf5639msh9c8d797536e7d47p192bb2jsnc56a3005c1b1',
            'x-rapidapi-host': 'imdb8.p.rapidapi.com'
        }
    }
};

async function fetchContent(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching content:", error);
    }
}

async function loadMovies() {
    const movies = await fetchContent(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API}`);
    const moviesContent = document.getElementById("movies-content");
    movies.results.forEach(movie => {
        const div = document.createElement("div");
        div.textContent = movie.title;
        moviesContent.appendChild(div);
    });
}

async function loadAnime() {
    const anime = await fetchContent("https://api.consumet.org/anime");
    const animeContent = document.getElementById("anime-content");
    anime.results.forEach(animeItem => {
        const div = document.createElement("div");
        div.textContent = animeItem.title;
        animeContent.appendChild(div);
    });
}

loadMovies();
loadAnime();