import { fetchAndDisplayContent } from './fetchContent.js';

// Load default category
window.onload = () => {
  fetchAndDisplayContent('movie');
};