const TMDB_API = "648c004c97b5a1425c702528ab88ddac"; // Your TMDB API key

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

    // Check if there's any data
    if (movies && movies.results) {
        movies.results.forEach(movie => {
            const div = document.createElement("div");
            div.classList.add("content-item");
            div.innerHTML = `
                <h3>${movie.title}</h3>
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
                <p>${movie.overview}</p>
            `;
            moviesContent.appendChild(div);
        });
    } else {
        moviesContent.innerHTML = "<p>No movies found.</p>";
    }
}

async function loadAnime() {
    // Replace with your anime API or use the right endpoint
    const anime = await fetchContent("https://api.consumet.org/anime");
    const animeContent = document.getElementById("anime-content");

    // Check if anime data is present
    if (anime && anime.results) {
        anime.results.forEach(animeItem => {
            const div = document.createElement("div");
            div.classList.add("content-item");
            div.innerHTML = `
                <h3>${animeItem.title}</h3>
                <img src="${animeItem.image_url}" alt="${animeItem.title}" />
                <p>${animeItem.synopsis}</p>
            `;
            animeContent.appendChild(div);
        });
    } else {
        animeContent.innerHTML = "<p>No anime found.</p>";
    }
}

// Load content when the page is ready
window.onload = () => {
    loadMovies();
    loadAnime();
};
