// Configuration
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentPage = 1;
let totalPages = 1;
let currentGenre = '';
let currentSort = 'popularity.desc';

// Genre mapping
const GENRE_MAP = {
  '28': 'Action',
  '35': 'Comedy',
  '18': 'Drama',
  '27': 'Horror',
  '10749': 'Romance',
  '878': 'Sci-Fi'
};

// API Key should be stored in environment variables or secure configuration
const API_KEY = 'YOUR_API_KEY_HERE';

async function fetchMovies(page = 1, genre = '', sort = 'popularity.desc') {
  try {
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sort}&page=${page}&with_watch_monetization_types=flatrate&page_size=25`;
    if (genre) {
      url += `&with_genres=${genre}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    totalPages = data.total_pages;
    return data.results.slice(0, 25);
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
}

function displayMovies(movies) {
  const container = document.getElementById('movies-list');
  const paginationContainer = document.querySelector('.pagination-container');
  
  if (!container || !paginationContainer) {
    console.error('Required elements not found');
    return;
  }

  container.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${IMG_URL}${movie.poster_path || '/placeholder.jpg'}" alt="${movie.title}" />
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <div class="movie-meta">
          <span class="rating"><i class="fas fa-star"></i> ${movie.vote_average || 0}</span>
          <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
        </div>
      </div>
    `;
    card.onclick = () => showDetails(movie);
    container.appendChild(card);
  });
  addPagination(paginationContainer);
}

function addPagination(container) {
  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadMovies();
    }
  };

  // Page number
  const pageNum = document.createElement('span');
  pageNum.className = 'page-number';
  pageNum.textContent = `Page ${currentPage}`;

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadMovies();
    }
  };

  pagination.appendChild(prevBtn);
  pagination.appendChild(pageNum);
  pagination.appendChild(nextBtn);
  container.innerHTML = '';
  container.appendChild(pagination);
}

async function loadMovies() {
  try {
    const movies = await fetchMovies(currentPage, currentGenre, currentSort);
    if (movies) {
      displayMovies(movies);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading movies:', error);
    // Show error message to user
    const container = document.getElementById('movies-list');
    if (container) {
      container.innerHTML = '<div class="error-message">Failed to load movies. Please try again later.</div>';
    }
  }
}

async function filterMovies() {
  currentGenre = document.getElementById('genre-filter').value;
  currentSort = document.getElementById('sort-filter').value;
  currentPage = 1;
  await loadMovies();
}

async function fetchRelatedMovies(movie) {
  try {
    const relatedContainer = document.getElementById('related-movies');
    relatedContainer.innerHTML = '<div class="loading">Loading related movies...</div>';

    // Get similar movies using TMDB API
    const response = await fetch(`${BASE_URL}/movie/${movie.id}/similar?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    
    // Get 6 related movies
    const relatedMovies = data.results.slice(0, 6);

    // Create HTML for related movies
    relatedContainer.innerHTML = relatedMovies.map(movie => `
      <div class="related-item" onclick="showDetails(${JSON.stringify(movie)})">
        <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" />
        <div class="related-item-info">
          <h4>${movie.title}</h4>
          <span>${movie.release_date?.split('-')[0]}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching related movies:', error);
    document.getElementById('related-movies').innerHTML = '<div class="error">Failed to load related movies</div>';
  }
}

function showDetails(movie) {
  currentItem = movie;
  document.getElementById('modal-title').textContent = movie.title;
  document.getElementById('modal-description').textContent = movie.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${movie.poster_path}`;
  // Update rating
  const rating = Math.round(movie.vote_average * 10) / 10;
  document.getElementById('modal-rating').textContent = rating;
  // Update year
  const year = movie.release_date?.split('-')[0];
  document.getElementById('modal-year').textContent = year;
  // Update genres
  const genresContainer = document.getElementById('modal-genres');
  genresContainer.innerHTML = '';
  movie.genre_ids?.forEach(genreId => {
    const genre = GENRE_MAP[genreId];
    if (genre) {
      const span = document.createElement('span');
      span.textContent = genre;
      genresContainer.appendChild(span);
    }
  });
  document.getElementById('modal').style.display = 'flex';
  fetchRelatedMovies(movie);
}

async function changeVidSrcServer() {
  try {
    const server = document.getElementById('vidsrc-server').value;
    const currentQuality = document.getElementById('video-quality').value;
    const videoElement = document.querySelector('video');
    
    if (videoElement) {
      videoElement.src = `https://${server}/video.mp4?quality=${currentQuality}`;
      videoElement.load();
    }
    
    document.getElementById('vidsrc-server').classList.remove('error');
    document.getElementById('vidplay-server').classList.remove('error');
    document.getElementById('mycloud-server').classList.remove('error');
    
    document.getElementById('vidsrc-server').classList.add('active');
  } catch (error) {
    console.error('Error changing VidSrc server:', error);
    showError('Failed to change video server');
  }
}

async function changeVidplayServer() {
  try {
    const server = document.getElementById('vidplay-server').value;
    const currentQuality = document.getElementById('video-quality').value;
    const videoElement = document.querySelector('video');
    
    if (videoElement) {
      videoElement.src = `https://${server}/video.mp4?quality=${currentQuality}`;
      videoElement.load();
    }
    
    document.getElementById('vidsrc-server').classList.remove('error');
    document.getElementById('vidplay-server').classList.remove('error');
    document.getElementById('mycloud-server').classList.remove('error');
    
    document.getElementById('vidplay-server').classList.add('active');
  } catch (error) {
    console.error('Error changing Vidplay server:', error);
    showError('Failed to change streaming server');
  }
}

async function changeMyCloudServer() {
  try {
    const server = document.getElementById('mycloud-server').value;
    const currentQuality = document.getElementById('video-quality').value;
    const videoElement = document.querySelector('video');
    
    if (videoElement) {
      videoElement.src = `https://${server}/video.mp4?quality=${currentQuality}`;
      videoElement.load();
    }
    
    document.getElementById('vidsrc-server').classList.remove('error');
    document.getElementById('vidplay-server').classList.remove('error');
    document.getElementById('mycloud-server').classList.remove('error');
    
    document.getElementById('mycloud-server').classList.add('active');
  } catch (error) {
    console.error('Error changing MyCloud server:', error);
    showError('Failed to change cloud server');
  }
}

async function updateVideoSource(server) {
  try {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;
    
    const currentQuality = document.getElementById('video-quality').value;
    const currentSubtitle = document.getElementById('subtitle-select').value;
    
    videoElement.src = `https://${server}/video.mp4?quality=${currentQuality}&subtitle=${currentSubtitle}`;
    videoElement.load();
    
    showSuccess('Server updated successfully');
  } catch (error) {
    console.error('Error updating video source:', error);
    showError('Failed to update video source');
  }
}

async function changeQuality() {
  try {
    const quality = document.getElementById('video-quality').value;
    const currentServer = document.querySelector('.server-select.active');
    
    if (currentServer) {
      await updateVideoSource(currentServer.value);
    }
  } catch (error) {
    console.error('Error changing quality:', error);
    showError('Failed to change video quality');
  }
}

async function changeSubtitle() {
  try {
    const subtitle = document.getElementById('subtitle-select').value;
    const currentServer = document.querySelector('.server-select.active');
    
    if (currentServer) {
      await updateVideoSource(currentServer.value);
    }
  } catch (error) {
    console.error('Error changing subtitle:', error);
    showError('Failed to change subtitles');
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '20px';
  errorDiv.style.right = '20px';
  errorDiv.style.backgroundColor = '#e50914';
  errorDiv.style.color = '#fff';
  errorDiv.style.padding = '10px 20px';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.zIndex = '1000';
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.position = 'fixed';
  successDiv.style.top = '20px';
  successDiv.style.right = '20px';
  successDiv.style.backgroundColor = '#22b14c';
  successDiv.style.color = '#fff';
  successDiv.style.padding = '10px 20px';
  successDiv.style.borderRadius = '4px';
  successDiv.style.zIndex = '1000';
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchMovies() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=1`);
    if (!res.ok) throw new Error('Failed to fetch search results');
    
    const data = await res.json();
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    // Limit to first 10 results
    const limitedResults = data.results.slice(0, 10);
    
    if (limitedResults.length === 0) {
      container.innerHTML = '<div class="no-results">No movies found</div>';
      return;
    }

    limitedResults.forEach(movie => {
      if (!movie.poster_path) return;
      const card = document.createElement('div');
      card.className = 'search-card';
      card.innerHTML = `
        <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" />
        <div class="search-info">
          <h3>${movie.title}</h3>
          <div class="search-meta">
            <span class="rating"><i class="fas fa-star"></i> ${Math.round(movie.vote_average * 10) / 10}</span>
            <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
          </div>
        </div>
      `;
      card.onclick = () => {
        closeSearchModal();
        showDetails(movie);
      };
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Search error:', error);
    const container = document.getElementById('search-results');
    container.innerHTML = '<div class="no-results">Error loading search results. Please try again.</div>';
  }
}

function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}

// Initialize
loadMovies(); 