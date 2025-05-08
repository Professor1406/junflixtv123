// Configuration
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentPage = 1;
let totalPages = 1;
let currentGenre = '';
let currentSort = 'popularity.desc';

// Genre mapping for Anime
const GENRE_MAP = {
  '16': 'Animation',
  '28': 'Action',
  '12': 'Adventure',
  '35': 'Comedy',
  '18': 'Drama',
  '14': 'Fantasy',
  '27': 'Horror',
  '9648': 'Mystery',
  '10749': 'Romance',
  '878': 'Sci-Fi',
  '53': 'Thriller'
};

// API Key should be stored in environment variables or secure configuration
const API_KEY = 'YOUR_API_KEY_HERE';

async function fetchAnime(page = 1, genre = '', sort = 'popularity.desc') {
  try {
    let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=${sort}&page=${page}&with_original_language=ja&with_genres=16&page_size=25`;
    if (genre && genre !== '16') {
      url += `,${genre}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    totalPages = data.total_pages;
    return data.results.slice(0, 25);
  } catch (error) {
    console.error('Error fetching anime:', error);
    throw error;
  }
}

function displayAnime(animeList) {
  const container = document.getElementById('anime-list');
  const paginationContainer = document.querySelector('.pagination-container');
  
  if (!container || !paginationContainer) {
    console.error('Required elements not found');
    return;
  }

  container.innerHTML = '';
  animeList.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${IMG_URL}${anime.poster_path || '/placeholder.jpg'}" alt="${anime.name}" />
      <div class="movie-info">
        <h3>${anime.name}</h3>
        <div class="movie-meta">
          <span class="rating"><i class="fas fa-star"></i> ${anime.vote_average || 0}</span>
          <span class="year">${anime.first_air_date?.split('-')[0] || 'N/A'}</span>
        </div>
      </div>
    `;
    card.onclick = () => showDetails(anime);
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
      loadAnime();
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
      loadAnime();
    }
  };

  pagination.appendChild(prevBtn);
  pagination.appendChild(pageNum);
  pagination.appendChild(nextBtn);
  container.innerHTML = '';
  container.appendChild(pagination);
}

async function loadAnime() {
  try {
    const animeList = await fetchAnime(currentPage, currentGenre, currentSort);
    if (animeList) {
      displayAnime(animeList);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading anime:', error);
    // Show error message to user
    const container = document.getElementById('anime-list');
    if (container) {
      container.innerHTML = '<div class="error-message">Failed to load anime. Please try again later.</div>';
    }
  }
}

async function filterAnime() {
  currentGenre = document.getElementById('genre-filter').value;
  currentSort = document.getElementById('sort-filter').value;
  currentPage = 1;
  await loadAnime();
}

async function fetchRelatedAnime(anime) {
  try {
    const relatedContainer = document.getElementById('related-anime');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
      <div class="spinner"></div>
      <span>Loading related anime...</span>
    `;
    relatedContainer.innerHTML = '';
    relatedContainer.appendChild(loadingDiv);

    // Get similar anime using TMDB API
    const response = await fetch(`${BASE_URL}/tv/${anime.id}/similar?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    
    // Filter to get only Japanese anime
    const relatedAnime = data.results.filter(anime => anime.original_language === 'ja').slice(0, 6);

    // Create HTML for related anime
    const relatedGrid = document.createElement('div');
    relatedGrid.className = 'related-grid';
    relatedGrid.innerHTML = relatedAnime.map(anime => `
      <div class="related-item" onclick="showDetails(${JSON.stringify(anime)})">
        <img src="${IMG_URL}${anime.poster_path}" alt="${anime.name}" />
        <div class="related-item-info">
          <h4>${anime.name}</h4>
          <span>${anime.first_air_date?.split('-')[0]}</span>
        </div>
      </div>
    `).join('');
    
    // Add placeholder items if there are fewer than 6 results
    if (relatedAnime.length < 6) {
      const placeholders = 6 - relatedAnime.length;
      for (let i = 0; i < placeholders; i++) {
        relatedGrid.innerHTML += `
          <div class="related-item placeholder">
            <div class="placeholder-content"></div>
          </div>
        `;
      }
    }

    relatedContainer.innerHTML = '';
    relatedContainer.appendChild(relatedGrid);
  } catch (error) {
    console.error('Error fetching related anime:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>Failed to load related anime</span>
    `;
    document.getElementById('related-anime').innerHTML = '';
    document.getElementById('related-anime').appendChild(errorDiv);
  }
}

function showDetails(anime) {
  currentItem = anime;
  document.getElementById('modal-title').textContent = anime.name;
  document.getElementById('modal-description').textContent = anime.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${anime.poster_path}`;
  // Update rating
  const rating = Math.round(anime.vote_average * 10) / 10;
  document.getElementById('modal-rating').textContent = rating;
  // Update year
  const year = anime.first_air_date?.split('-')[0];
  document.getElementById('modal-year').textContent = year;
  // Update genres
  const genresContainer = document.getElementById('modal-genres');
  genresContainer.innerHTML = '';
  anime.genre_ids?.forEach(genreId => {
    const genre = GENRE_MAP[genreId];
    if (genre) {
      const span = document.createElement('span');
      span.textContent = genre;
      genresContainer.appendChild(span);
    }
  });
  document.getElementById('modal').style.display = 'flex';
  fetchRelatedAnime(anime);
}

async function changeServer(server) {
  try {
    const currentQuality = document.getElementById('video-quality').value;
    const currentSubtitle = document.getElementById('subtitle-select').value;
    const videoElement = document.querySelector('video');
    
    if (videoElement) {
      videoElement.src = `https://api.jflixtv.com/v1/stream/${currentItem.episode_id || currentItem.id}?server=${server}&quality=${currentQuality}&subtitle=${currentSubtitle}`;
      videoElement.load();
    }
    
    document.getElementById('vidsrc-server').classList.remove('error');
    document.getElementById('vidplay-server').classList.remove('error');
    document.getElementById('mycloud-server').classList.remove('error');
    
    document.getElementById(server).classList.add('active');
  } catch (error) {
    console.error('Error changing server:', error);
    showError('Failed to change server');
  }
}

async function changeVidSrcServer() {
  await changeServer('vidsrc.to');
}

async function changeVidplayServer() {
  await changeServer('vidplay.to');
}

async function changeMyCloudServer() {
  await changeServer('mycloud.to');
}

async function updateVideoSource(server) {
  try {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;
    
    const currentQuality = document.getElementById('video-quality').value;
    const currentSubtitle = document.getElementById('subtitle-select').value;
    
    videoElement.src = `https://api.jflixtv.com/v1/stream/${currentItem.episode_id || currentItem.id}?server=${server}&quality=${currentQuality}&subtitle=${currentSubtitle}`;
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
    const currentServer = document.querySelector('.server-select.active').value;
    
    if (currentServer) {
      await updateVideoSource(currentServer);
    }
  } catch (error) {
    console.error('Error changing quality:', error);
    showError('Failed to change video quality');
  }
}

async function changeSubtitle() {
  try {
    const subtitle = document.getElementById('subtitle-select').value;
    const currentServer = document.querySelector('.server-select.active').value;
    
    if (currentServer) {
      await updateVideoSource(currentServer);
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

// Initialize servers when modal opens
async function showDetails(anime) {
  currentItem = anime;
  document.getElementById('modal-image').src = anime.poster_path;
  document.getElementById('modal-title').textContent = anime.title;
  document.getElementById('modal-rating').textContent = anime.vote_average;
  document.getElementById('modal-year').textContent = anime.release_date;
  document.getElementById('modal-description').textContent = anime.overview;
  
  const genresContainer = document.getElementById('modal-genres');
  genresContainer.innerHTML = '';
  
  anime.genres.forEach(genre => {
    const span = document.createElement('span');
    span.textContent = genre.name;
    genresContainer.appendChild(span);
  });
  
  // Initialize server selectors
  document.getElementById('vidsrc-server').value = 'vidsrc.to';
  document.getElementById('vidplay-server').value = 'vidplay.to';
  document.getElementById('mycloud-server').value = 'mycloud.to';
  document.getElementById('video-quality').value = 'auto';
  document.getElementById('subtitle-select').value = 'auto';
  
  // Load related anime
  await fetchRelatedAnime(anime);
  
  // Show modal
  document.getElementById('modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'block';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
}

async function searchAnime() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  
  try {
    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
    const data = await response.json();
    
    const results = document.getElementById('search-results');
    results.innerHTML = ''; // Clear previous results
    
    if (data.results && data.results.length > 0) {
      data.results.forEach(anime => {
        if (anime.original_language === 'ja') {
          const result = document.createElement('div');
          result.className = 'search-result';
          result.innerHTML = `
            <img src="${IMG_URL}${anime.poster_path}" alt="${anime.name}" />
            <div class="search-result-info">
              <h3>${anime.name}</h3>
              <span>${anime.first_air_date?.split('-')[0]}</span>
            </div>
          `;
          result.onclick = () => {
            showDetails(anime);
            closeSearchModal();
          };
          results.appendChild(result);
        }
      });
    } else {
      results.innerHTML = '<p>No anime found matching your search.</p>';
    }
  } catch (error) {
    console.error('Error searching anime:', error);
    const results = document.getElementById('search-results');
    results.innerHTML = '<p>Error occurred while searching. Please try again.</p>';
  }
}

function toggleMenu() {
  const menu = document.querySelector('.nav-links');
  menu.classList.toggle('active');
}

// Initialize
loadAnime(); 