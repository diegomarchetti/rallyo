// Grid and field management

function setGridSize(size) {
    config.state.gridSize = size;
    document.querySelectorAll('.grid-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    drawGrid();
}

function toggleGrid() {
    config.state.gridVisible = !config.state.gridVisible;
    drawGrid();
}

function updateFieldSize() {
    // Get values from inputs
    const newWidth = parseInt(document.getElementById('fieldWidth').value) || 800;
    const newHeight = parseInt(document.getElementById('fieldHeight').value) || 600;
    
    // Ensure minimum sizes
    config.state.fieldWidth = Math.max(newWidth, 600);
    config.state.fieldHeight = Math.max(newHeight, 400);
    
    // Update field dimensions
    updateField();
}

function autoSizeField() {
    const canvasArea = document.getElementById('canvasArea');
    const padding = 30; // Padding around the field (green border)
    
    // Calculate available space
    const availableWidth = canvasArea.clientWidth - (padding * 2);
    const availableHeight = canvasArea.clientHeight - (padding * 2);
    
    // Set field size (with some minimum dimensions)
    config.state.fieldWidth = Math.max(availableWidth, 600);
    config.state.fieldHeight = Math.max(availableHeight, 400);
    
    // Update input fields
    document.getElementById('fieldWidth').value = config.state.fieldWidth;
    document.getElementById('fieldHeight').value = config.state.fieldHeight;
    
    // Update field display
    updateField();
}

function updateField() {
    const field = document.getElementById('field');
    
    // Use direct pixel values
    field.style.width = config.state.fieldWidth + 'px';
    field.style.height = config.state.fieldHeight + 'px';
    
    // Center the field in the canvas area
    const canvasArea = document.getElementById('canvasArea');
    const containerWidth = canvasArea.clientWidth;
    const containerHeight = canvasArea.clientHeight;
    
    const leftPosition = Math.max((containerWidth - config.state.fieldWidth) / 2, 0);
    const topPosition = Math.max((containerHeight - config.state.fieldHeight) / 2, 0);
    
    field.style.left = leftPosition + 'px';
    field.style.top = topPosition + 'px';
    
    drawGrid();
}

function drawGrid() {
    const svg = document.getElementById('gridSvg');
    const field = document.getElementById('field');
    
    svg.innerHTML = '';
    if (!config.state.gridVisible) return;

    const width = field.clientWidth;
    const height = field.clientHeight;
    
    // Set SVG dimensions to match field
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    
    // Position SVG to match field position
    svg.style.left = field.style.left;
    svg.style.top = field.style.top;
    
    const gridPixels = config.state.gridSize;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridPixels) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', height);
        line.setAttribute('stroke', '#34495e');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.3');
        svg.appendChild(line);
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridPixels) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#34495e');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.3');
        svg.appendChild(line);
    }
}

// Function to update the display of field information
function updateFieldInfo() {
    document.getElementById('currentLevel').textContent = config.state.currentLevel;
    document.getElementById('stationCount').textContent = `${config.state.stationCounter}/${config.levels[config.state.currentLevel].maxStations}`;
    document.getElementById('authorDisplay').textContent = config.state.metadata.author || '-';
}

function clearFieldWithoutConfirm() {
    // Remove all placed items from DOM
    const allPlacedItems = document.querySelectorAll('.placed-item');
    allPlacedItems.forEach(element => {
        element.remove();
    });
    
    // Clear the array completely
    config.state.placedItems.splice(0, config.state.placedItems.length);
    
    // Reset counters
    config.state.stationCounter = 0;
    config.state.selectedItem = null;
    
    // Update displays
    updateStationCount();
    updateCartelliGrid();
}

// Initialize field on window resize
window.addEventListener('resize', function() {
    // Only auto-size if field dimensions haven't been manually changed
    updateField();
});
