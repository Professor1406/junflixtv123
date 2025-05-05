import { APIs } from './api.js';

export function fetchAndDisplayContent(category) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `<h2>${category.toUpperCase()}</h2>`;

  const sources = APIs[category];
  if (sources && sources.length > 0) {
    sources.forEach(url => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.width = "100%";
      iframe.height = "500px";
      iframe.allowFullscreen = true;
      contentDiv.appendChild(iframe);
    });
  } else {
    contentDiv.innerHTML += "<p>No sources found.</p>";
  }
}