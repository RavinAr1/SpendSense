// Configuration
const config = {
  gridSize: 4,
  fps: 1,
  endpoints: {
      maskDetection: 'YOUR_MASK_DETECTION_API_ENDPOINT',
      aqiPrediction: 'YOUR_AQI_PREDICTION_API_ENDPOINT'
  }
};

// State management
const state = {
  isProcessing: false,
  lastFrameTime: 0,
  fpsCounter: 0,
  isUsingVideo: false,
  maskStats: {
      total: 0,
      masked: 0
  },
  aqiStats: {
      values: []
  }
};

// DOM Elements
const video = document.getElementById('video');
const gridCanvas = document.getElementById('gridCanvas');
const gridOverlay = document.getElementById('gridOverlay');
const ctx = gridCanvas.getContext('2d');
const fpsDisplay = document.getElementById('fps');
const connectionStatus = document.getElementById('connection-status');
const videoUpload = document.getElementById('videoUpload');
const switchToCameraBtn = document.getElementById('switchToCamera');

// Initialize video stream
async function initializeCamera() {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 }
          }
      });
      video.srcObject = stream;
      updateConnectionStatus(true);
      state.isUsingVideo = false;
      switchToCameraBtn.style.display = 'none';
      
      // Set canvas size after video loads
      video.onloadedmetadata = () => {
          gridCanvas.width = video.videoWidth;
          gridCanvas.height = video.videoHeight;
          initializeGrid();
      };
  } catch (error) {
      console.error('Error accessing camera:', error);
      updateConnectionStatus(false);
  }
}

// Handle video file upload
videoUpload.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
      const videoUrl = URL.createObjectURL(file);
      if (video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => track.stop());
      }
      video.srcObject = null;
      video.src = videoUrl;
      state.isUsingVideo = true;
      switchToCameraBtn.style.display = 'block';
      updateConnectionStatus(true);
  }
});

// Switch back to camera
switchToCameraBtn.addEventListener('click', () => {
  if (video.src) {
      URL.revokeObjectURL(video.src);
      video.src = '';
  }
  initializeCamera();
});

// Initialize grid overlay
function initializeGrid() {
  gridOverlay.style.display = 'grid';
  gridOverlay.innerHTML = '';
  
  for (let i = 0; i < config.gridSize * config.gridSize; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.innerHTML = `
          <div class="mask-status"></div>
          <div class="aqi-value"></div>
      `;
      gridOverlay.appendChild(cell);
  }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
  const dot = connectionStatus.querySelector('.status-dot');
  const text = connectionStatus.querySelector('.status-text');
  
  if (connected) {
      dot.classList.add('connected');
      text.textContent = 'Connected';
  } else {
      dot.classList.remove('connected');
      text.textContent = 'Disconnected';
  }
}

// Process single frame
async function processFrame() {
  if (state.isProcessing) return;
  
  const now = Date.now();
  if (now - state.lastFrameTime < 1000 / config.fps) return;
  
  state.isProcessing = true;
  state.lastFrameTime = now;
  
  // Draw current frame to canvas
  ctx.drawImage(video, 0, 0, gridCanvas.width, gridCanvas.height);
  
  // Process each grid cell
  const cellWidth = gridCanvas.width / config.gridSize;
  const cellHeight = gridCanvas.height / config.gridSize;
  
  const promises = [];
  
  for (let row = 0; row < config.gridSize; row++) {
      for (let col = 0; col < config.gridSize; col++) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          
          // Get image data for current cell
          const imageData = ctx.getImageData(x, y, cellWidth, cellHeight);
          
          // Create promises for API calls
          promises.push(
              processGridCell(imageData, row * config.gridSize + col)
          );
      }
  }
  
  try {
      await Promise.all(promises);
      updateStats();
  } catch (error) {
      console.error('Error processing frame:', error);
  }
  
  state.isProcessing = false;
  state.fpsCounter++;
}

// Process single grid cell
async function processGridCell(imageData, cellIndex) {
  const cell = gridOverlay.children[cellIndex];
  
  try {
      // Convert imageData to base64
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const tempCtx = canvas.getContext('2d');
      tempCtx.putImageData(imageData, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      // Make API calls in parallel
      const [maskResult, aqiResult] = await Promise.all([
          callMaskDetectionAPI(base64Image),
          callAQIPredictionAPI(base64Image)
      ]);
      
      updateCellDisplay(cell, maskResult, aqiResult);
      
  } catch (error) {
      cell.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      cell.innerHTML = '<div class="error">Error fetching data</div>';
  }
}

// API calls
async function callMaskDetectionAPI(base64Image) {
  try {
      const response = await fetch(config.endpoints.maskDetection, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) throw new Error('Mask detection API error');
      return await response.json();
  } catch (error) {
      throw new Error('Mask detection failed');
  }
}

async function callAQIPredictionAPI(base64Image) {
  try {
      const response = await fetch(config.endpoints.aqiPrediction, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) throw new Error('AQI prediction API error');
      return await response.json();
  } catch (error) {
      throw new Error('AQI prediction failed');
  }
}

// Get color for AQI value
function getAQIColor(aqi) {
  if (aqi <= 50) return 'var(--aqi-good)';
  if (aqi <= 100) return 'var(--aqi-moderate)';
  if (aqi <= 150) return 'var(--aqi-sensitive)';
  if (aqi <= 200) return 'var(--aqi-unhealthy)';
  if (aqi <= 300) return 'var(--aqi-very-unhealthy)';
  return 'var(--aqi-severe)';
}

function getAQIClass(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Severe';
}

// Update cell display
function updateCellDisplay(cell, maskResult, aqiResult) {
  // Update mask status
  cell.style.backgroundColor = maskResult.allMasked ? 
      'rgba(0, 255, 0, 0.3)' : 
      'rgba(255, 0, 0, 0.3)';
  
  // Update AQI value
  const aqiValue = aqiResult.value;
  const aqiColor = getAQIColor(aqiValue);
  const aqiClass = getAQIClass(aqiValue);
  
  cell.innerHTML = `
      <div class="mask-status">${maskResult.allMasked ? '✓' : '✗'}</div>
      <div class="aqi-value" style="color: ${aqiColor}">
          AQI: ${aqiValue}
          <small>(${aqiClass})</small>
      </div>
  `;
}

// Update statistics
function updateStats() {
  // Update FPS counter
  if (Date.now() - state.lastFPSUpdate >= 1000) {
      fpsDisplay.textContent = state.fpsCounter;
      state.fpsCounter = 0;
      state.lastFPSUpdate = Date.now();
  }
  
  // Update mask compliance and AQI statistics
  const cells = Array.from(gridOverlay.children);
  const maskCompliance = cells.filter(cell => 
      cell.style.backgroundColor === 'rgba(0, 255, 0, 0.3)'
  ).length / cells.length * 100;
  
  document.getElementById('overallMaskRate').textContent = 
      ${maskCompliance.toFixed(1)}%;
  
  const aqiValues = cells
      .map(cell => {
          const aqiText = cell.querySelector('.aqi-value')?.textContent;
          return aqiText ? parseInt(aqiText.replace('AQI: ', '')) : null;
      })
      .filter(val => val !== null);
  
  const averageAQI = aqiValues.length ? 
      Math.round(aqiValues.reduce((a, b) => a + b) / aqiValues.length) : 
      '--';
  
  document.getElementById('averageAQI').textContent = averageAQI;
}

// Main loop
function mainLoop() {
  processFrame();
  requestAnimationFrame(mainLoop);
}

// Initialize application
async function initialize() {
  await initializeCamera();
  mainLoop();
}

// Start the application
initialize().catch(console.error);

// Event Listeners
document.getElementById('toggleStats').addEventListener('click', () => {
  const content = document.querySelector('.stats-content');
  content.style.display = content.style.display === 'none' ? 'block' : 'none';
});