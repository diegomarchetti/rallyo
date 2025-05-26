// Initialize application and setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initial setup
    checkScreenSize();
    loadCartelli();
    setupEventListeners();
    initializeField();
    updateFieldInfo();
});

function checkScreenSize() {
    if (window.innerWidth < 1200 || window.innerHeight < 800) {
        document.getElementById('warning').classList.remove('hidden');
    }
}

function closeWarning() {
    document.getElementById('warning').classList.add('hidden');
}

function initializeField() {
    // Automatically size the field to fit the screen on initial load
    autoSizeField();
    
    // Draw the grid
    drawGrid();
}

function setupEventListeners() {
    const canvasArea = document.getElementById('canvasArea');
    canvasArea.addEventListener('dragover', e => e.preventDefault());
    canvasArea.addEventListener('drop', handleDrop);
    canvasArea.addEventListener('click', handleCanvasClick);

    // Object drag events
    document.querySelectorAll('.object-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });

    // Window resize event
    window.addEventListener('resize', () => {
        updateField();
        drawGrid();
    });

    // Modal closing with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Delete selected item
        if (config.state.selectedItem && (e.key === 'Delete' || e.key === 'Backspace')) {
            removeItem(config.state.selectedItem);
        }
        
        // Save course with Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCourse();
        }
        
        // Help with F1 key
        if (e.key === 'F1') {
            e.preventDefault();
            toggleModal('helpModal');
        }
    });
    
    // Update field info when metadata changes
    document.getElementById('authorDisplay').addEventListener('DOMSubtreeModified', function() {
        // Any time the author display changes, update other related UI elements
        updateFieldInfo();
    });
}

function updateStationCount() {
    const maxStations = config.levels[config.state.currentLevel].maxStations;
    document.getElementById('stationCount').textContent = `${config.state.stationCounter}/${maxStations}`;
    
    // Check if we're over the limit
    if (config.state.stationCounter > maxStations) {
        document.getElementById('stationCount').style.color = '#e74c3c';
    } else {
        document.getElementById('stationCount').style.color = '';
    }
}

// Update level info display
function updateLevelInfo() {
    const levelInfo = document.getElementById('levelInfo');
    const currentLevel = config.levels[config.state.currentLevel];
    levelInfo.textContent = `Stazioni: ${currentLevel.maxStations} max`;
    
    // Update the level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === config.state.currentLevel);
    });
    
    updateStationCount();
}

function setLevel(level) {
    config.state.currentLevel = level;
    document.getElementById('currentLevel').textContent = level;
    updateLevelInfo();
    updateCartelliGrid();
}

// Function to toggle modal visibility
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
    }
}
