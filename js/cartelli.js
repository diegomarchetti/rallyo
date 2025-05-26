// Functions for managing cartelli display, loading, and creation
let cartelli = {}; // Will hold all cartelli data

function setLevel(level) {
    config.state.currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('levelInfo').textContent = `Stazioni: ${config.levels[level].maxStations} max`;
    
    // Clear search when changing levels
    document.getElementById('cartelloSearch').value = '';
    
    updateCartelliGrid();
    updateStationCount();
}

// Load and organize cartelli from file paths
function loadCartelli() {
    // Basic cartelli (always available)
    const baseCartelli = [
        { id: 'start', name: 'START', imagePath: 'ASSETS/START.jpg' },
        { id: 'finish', name: 'FINISH', imagePath: 'ASSETS/FINISH.jpg' },
        { id: 'bonus-start', name: 'BONUS START', imagePath: 'ASSETS/BONUS-START.jpg' },
        { id: 'bonus-finish', name: 'BONUS FINISH', imagePath: 'ASSETS/BONUS-FINISH.jpg' }
    ];

    // JOLLY cartello - available only in L3
    const jollyCartello = { id: 'jolly', name: 'JOLLY', imagePath: 'ASSETS/JOLLY.jpg' };

    // Initialize empty arrays for each level
    const regularCartelli = {};
    const bonusCartelli = {};
    const L3BCartelli = [];

    // L1 cartelli (1-32)
    regularCartelli.L1 = [];
    for (let i = 1; i <= 32; i++) {
        regularCartelli.L1.push({
            id: i.toString(),
            name: `Cartello ${i}`,
            imagePath: `ASSETS/${i.toString().padStart(2, '0')}-L1-L2-L3.jpg`
        });
    }

    // L2 cartelli (33-48)
    regularCartelli.L2 = [];
    for (let i = 33; i <= 48; i++) {
        regularCartelli.L2.push({
            id: i.toString(),
            name: `Cartello ${i}`,
            imagePath: `ASSETS/${i.toString().padStart(2, '0')}-L2-L3.jpg`
        });
    }

    // L3 cartelli (49-67)
    regularCartelli.L3 = [];
    for (let i = 49; i <= 67; i++) {
        regularCartelli.L3.push({
            id: i.toString(),
            name: `Cartello ${i}`,
            imagePath: `ASSETS/${i.toString().padStart(2, '0')}-L3.jpg`
        });
    }

    // L3B Extra cartelli
    for (let i = 1; i <= 14; i++) {
        let fileName = `ASSETS/${i.toString().padStart(2, '0')}-LB3-EXTRA.jpg`;
        // Special case for cartello 4 which has A and B variants
        if (i === 4) {
            L3BCartelli.push({
                id: `LB3-${i}A`,
                name: `LB3 ${i}A`,
                imagePath: `ASSETS/${i.toString().padStart(2, '0')}A-LB3-EXTRA.jpg`
            });
            L3BCartelli.push({
                id: `LB3-${i}B`,
                name: `LB3 ${i}B`,
                imagePath: `ASSETS/${i.toString().padStart(2, '00')}B-LB3-EXTRA.jpg`
            });
        } else {
            L3BCartelli.push({
                id: `LB3-${i}`,
                name: `LB3 ${i}`,
                imagePath: fileName
            });
        }
    }
    
    // Add standard cartelli that should also appear in L3B
    const L3BAdditionalCartelli = [7, 8, 9, 10, 11, 12, 48, 59, 60];
    L3BAdditionalCartelli.forEach(num => {
        // Determine the correct file path based on cartello number
        let imagePath = '';
        if (num <= 32) {
            imagePath = `ASSETS/${num.toString().padStart(2, '0')}-L1-L2-L3.jpg`;
        } else if (num <= 48) {
            imagePath = `ASSETS/${num.toString().padStart(2, '0')}-L2-L3.jpg`;
        } else {
            imagePath = `ASSETS/${num.toString().padStart(2, '0')}-L3.jpg`;
        }
        
        L3BCartelli.push({
            id: num.toString(),
            name: `Cartello ${num}`,
            imagePath: imagePath
        });
    });

    // Add bonus cartelli for L1
    bonusCartelli.L1 = [];
    for (let i = 1; i <= 5; i++) {
        bonusCartelli.L1.push({
            id: `bonus-L1-${i}`,
            name: `Bonus L1 ${i}`,
            imagePath: `ASSETS/BONUS-L1-${i.toString().padStart(2, '0')}.jpg`
        });
    }

    // Add bonus cartelli for L2
    bonusCartelli.L2 = [];
    for (let i = 1; i <= 10; i++) {
        // Special case for first L2 bonus cartello due to filename difference
        const fileName = i === 1 ? 'BONUS-L2-01.jpg' : `BONUS-L2-${i.toString().padStart(2, '0')}.jpg`;
        bonusCartelli.L2.push({
            id: `bonus-L2-${i}`,
            name: `Bonus L2 ${i}`,
            imagePath: `ASSETS/${fileName}`
        });
    }

    // Add bonus cartelli for L3
    bonusCartelli.L3 = [];
    for (let i = 1; i <= 8; i++) {
        bonusCartelli.L3.push({
            id: `bonus-L3-${i}`,
            name: `Bonus L3 ${i}`,
            imagePath: `ASSETS/BONUS-L3-${i.toString().padStart(2, '0')}.jpg`
        });
    }

    // Create the final cartelli object with properly organized levels
    cartelli = {
        base: baseCartelli,
        jolly: jollyCartello,
        regular: regularCartelli,
        bonus: bonusCartelli,
        L3B: L3BCartelli
    };

    // Make cartelli available globally
    window.cartelli = cartelli;

    updateCartelliGrid();
}

function updateCartelliGrid() {
    const grid = document.getElementById('cartelliGrid');
    grid.innerHTML = '';
    
    // Check if we're filtering by search
    const searchText = document.getElementById('cartelloSearch').value.trim().toLowerCase();
    
    // Add base cartelli (START and FINISH) - always available in all levels
    cartelli.base.forEach(cartello => {
        // Check if this cartello is already used
        const isUsed = config.state.placedItems.find(item => item.id === cartello.id);
        
        // If search is active, check if this cartello matches
        if (searchText && !matchesSearch(cartello, searchText)) {
            return; // Skip if doesn't match search
        }
        
        if (!isUsed) {
            grid.appendChild(createCartelloElement(cartello));
        }
    });

    // Add JOLLY - only available in L3
    if (config.state.currentLevel === 'L3') {
        // Check if JOLLY is already used
        const jollyUsed = config.state.placedItems.find(item => item.id === 'jolly');
        
        // If search is active, check if JOLLY matches
        if ((!searchText || matchesSearch(cartelli.jolly, searchText)) && !jollyUsed) {
            grid.appendChild(createCartelloElement(cartelli.jolly));
        }
    }

    // Add level-specific cartelli based on current level
    let levelCartelli = [];
    
    if (config.state.currentLevel === 'L3B') {
        // L3B shows only its specific cartelli
        levelCartelli = cartelli.L3B;
    } else {
        // For other levels, show appropriate regular and bonus cartelli
        
        // Add regular cartelli for current level and below
        if (config.state.currentLevel === 'L1') {
            levelCartelli = [...cartelli.regular.L1];
        } else if (config.state.currentLevel === 'L2') {
            levelCartelli = [...cartelli.regular.L1, ...cartelli.regular.L2];
        } else if (config.state.currentLevel === 'L3') {
            levelCartelli = [...cartelli.regular.L1, ...cartelli.regular.L2, ...cartelli.regular.L3];
        }
        
        // Add bonus cartelli for the current level only (not levels below)
        if (config.state.currentLevel === 'L1') {
            levelCartelli = [...levelCartelli, ...cartelli.bonus.L1];
        } else if (config.state.currentLevel === 'L2') {
            levelCartelli = [...levelCartelli, ...cartelli.bonus.L2];
        } else if (config.state.currentLevel === 'L3') {
            levelCartelli = [...levelCartelli, ...cartelli.bonus.L3];
        }
    }

    // Render all cartelli for the current level
    levelCartelli.forEach(cartello => {
        // Check if this cartello is already used
        const isUsed = config.state.placedItems.find(item => item.id === cartello.id);
        
        // If search is active, check if this cartello matches
        if (searchText && !matchesSearch(cartello, searchText)) {
            return; // Skip if doesn't match search
        }
        
        if (!isUsed) {
            grid.appendChild(createCartelloElement(cartello));
        }
    });
    
    // Show a message if no cartelli match the search
    if (grid.children.length === 0 && searchText) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Nessun cartello trovato';
        noResults.style.width = '100%';
        noResults.style.padding = '10px';
        noResults.style.textAlign = 'center';
        noResults.style.color = '#7f8c8d';
        grid.appendChild(noResults);
    }
}

// Check if a cartello matches the search text
function matchesSearch(cartello, searchText) {
    // Match by ID number or name
    return cartello.id.toLowerCase().includes(searchText) || 
           cartello.name.toLowerCase().includes(searchText);
}

// Function to handle search input
function searchCartelli() {
    updateCartelliGrid();
}

// Function to clear search
function clearSearch() {
    document.getElementById('cartelloSearch').value = '';
    updateCartelliGrid();
}

function createCartelloElement(cartello) {
    const div = document.createElement('div');
    div.className = 'cartello-item';
    div.draggable = true;
    div.dataset.id = cartello.id;
    div.dataset.type = 'cartello';
    
    // Create icon with image
    const iconDiv = document.createElement('div');
    iconDiv.className = 'cartello-icon';
    
    // Check if we have an image path
    if (cartello.imagePath) {
        const img = document.createElement('img');
        img.src = cartello.imagePath;
        img.alt = cartello.name;
        iconDiv.appendChild(img);
    } else {
        // Fallback to text icon if no image
        iconDiv.textContent = cartello.icon || '📃';
    }
    
    // Create name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'cartello-name';
    nameDiv.textContent = cartello.name;
    
    div.appendChild(iconDiv);
    div.appendChild(nameDiv);

    div.addEventListener('dragstart', handleDragStart);
    return div;
}

function updateStationCount() {
    const current = config.state.placedItems.filter(item => item.stationNumber).length;
    const max = config.levels[config.state.currentLevel].maxStations;
    document.getElementById('stationCount').textContent = `${current}/${max}`;
    
    // Check if we're over the limit
    if (current > max) {
        document.getElementById('stationCount').style.color = '#e74c3c';
    } else {
        document.getElementById('stationCount').style.color = '';
    }
}
