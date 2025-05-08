// Configuration
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentPage = 1;
let totalPages = 1;
let currentGenre = '';
let currentSort = 'popularity.desc';

// Genre mapping for TV shows
const GENRE_MAP = {
  '10759': 'Action & Adventure',
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '10762': 'Kids',
  '9648': 'Mystery',
  '10763': 'News',
  '10764': 'Reality',
  '10765': 'Sci-Fi & Fantasy',
  '10766': 'Soap',
  '10767': 'Talk',
  '10768': 'War & Politics',
  '37': 'Western'
};

// API Key should be stored in environment variables or secure configuration
const API_KEY = 'YOUR_API_KEY_HERE';

async function fetchTVShows(page = 1, genre = '', sort = 'popularity.desc') {
  try {
    let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=${sort}&page=${page}&page_size=25`;
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
    console.error('Error fetching TV shows:', error);
    throw error;
  }
}

function displayTVShows(tvshows) {
  const container = document.getElementById('tvshows-list');
  const paginationContainer = document.querySelector('.pagination-container');
  
  if (!container || !paginationContainer) {
    console.error('Required elements not found');
    return;
  }

  container.innerHTML = '';
  tvshows.forEach(show => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${IMG_URL}${show.poster_path || '/placeholder.jpg'}" alt="${show.name}" />
      <div class="movie-info">
        <h3>${show.name}</h3>
        <div class="movie-meta">
          <span class="rating"><i class="fas fa-star"></i> ${show.vote_average || 0}</span>
          <span class="year">${show.first_air_date?.split('-')[0] || 'N/A'}</span>
        </div>
      </div>
    `;
    card.onclick = () => showDetails(show);
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
      loadTVShows();
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
      loadTVShows();
    }
  };

  pagination.appendChild(prevBtn);
  pagination.appendChild(pageNum);
  pagination.appendChild(nextBtn);
  container.innerHTML = '';
  container.appendChild(pagination);
}

async function loadTVShows() {
  const tvshows = await fetchTVShows(currentPage, currentGenre, currentSort);
  displayTVShows(tvshows);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function filterTVShows() {
  currentGenre = document.getElementById('genre-filter').value;
  currentSort = document.getElementById('sort-filter').value;
  currentPage = 1;
  await loadTVShows();
}

async function fetchRelatedTVShows(show) {
  try {
    const relatedContainer = document.getElementById('related-tvshows');
    relatedContainer.innerHTML = '<div class="loading">Loading related TV shows...</div>';

    // Get similar TV shows using TMDB API
    const response = await fetch(`${BASE_URL}/tv/${show.id}/similar?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    
    // Get 6 related TV shows
    const relatedShows = data.results.slice(0, 6);

    // Create HTML for related TV shows
    relatedContainer.innerHTML = relatedShows.map(show => `
      <div class="related-item" onclick="showDetails(${JSON.stringify(show)})">
        <img src="${IMG_URL}${show.poster_path}" alt="${show.name}" />
        <div class="related-item-info">
          <h4>${show.name}</h4>
          <span>${show.first_air_date?.split('-')[0]}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching related TV shows:', error);
    document.getElementById('related-tvshows').innerHTML = '<div class="error">Failed to load related TV shows</div>';
  }
}

function showDetails(show) {
  currentItem = show;
  document.getElementById('modal-title').textContent = show.name;
  document.getElementById('modal-description').textContent = show.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${show.poster_path}`;
  // Update rating
  const rating = Math.round(show.vote_average * 10) / 10;
  document.getElementById('modal-rating').textContent = rating;
  // Update year
  const year = show.first_air_date?.split('-')[0];
  document.getElementById('modal-year').textContent = year;
  // Update genres
  const genresContainer = document.getElementById('modal-genres');
  genresContainer.innerHTML = '';
  show.genre_ids?.forEach(genreId => {
    const genre = GENRE_MAP[genreId];
    if (genre) {
      const span = document.createElement('span');
      span.textContent = genre;
      genresContainer.appendChild(span);
    }
  });
  // Initialize with default server selection
  const defaultServer = 'vidsrc.me';
  document.getElementById('vidsrc-server').value = defaultServer;
  updateVideoSource(defaultServer);
  document.getElementById('modal').style.display = 'flex';
  fetchRelatedTVShows(show);
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
    changeServer();
  }
}

function changeSubtitle() {
  if (document.getElementById('modal-video').src) {
    changeServer();
  }
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

async function searchTVShows() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }
  const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&page=1`);
  const data = await res.json();
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  const limitedResults = data.results.slice(0, 10);
  if (limitedResults.length === 0) {
    container.innerHTML = '<div class="no-results">No TV shows found</div>';
    return;
  }
  limitedResults.forEach(show => {
    if (!show.poster_path) return;
    const card = document.createElement('div');
    card.className = 'search-card';
    card.innerHTML = `
      <img src="${IMG_URL}${show.poster_path}" alt="${show.name}" />
      <div class="search-info">
        <h3>${show.name}</h3>
        <div class="search-meta">
          <span class="rating"><i class="fas fa-star"></i> ${Math.round(show.vote_average * 10) / 10}</span>
          <span class="year">${show.first_air_date?.split('-')[0] || 'N/A'}</span>
        </div>
      </div>
    `;
    card.onclick = () => {
      closeSearchModal();
      showDetails(show);
    };
    container.appendChild(card);
  });
}

function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}

// Initialize
loadTVShows(); 