// Field items management (rendering, selection, rotation, removal)

function renderItem(item) {
    const div = document.createElement('div');
    div.className = 'placed-item';
    
    // Add specific class for object types
    if (item.type !== 'cartello') {
        div.classList.add(`${item.id.split('_')[0]}-object`);
    } else {
        div.classList.add('cartello');
    }
    
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    div.style.transform = `rotate(${item.rotation}deg)`;
    div.dataset.id = item.id;

    // Create controls container
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'rotation-controls';

    // Create rotation buttons
    const rotateLeftBtn = document.createElement('button');
    rotateLeftBtn.className = 'rotate-btn';
    rotateLeftBtn.textContent = '↶';
    rotateLeftBtn.type = 'button';
    rotateLeftBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Rotating left:', item.id);
        rotateItemById(item.id, -90);
    });

    const rotateRightBtn = document.createElement('button');
    rotateRightBtn.className = 'rotate-btn';
    rotateRightBtn.textContent = '↷';
    rotateRightBtn.type = 'button';
    rotateRightBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Rotating right:', item.id);
        rotateItemById(item.id, 90);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'rotate-btn';
    deleteBtn.style.background = '#e74c3c';
    deleteBtn.textContent = '✕';
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Deleting:', item.id);
        removeItem(item.id);
    });

    controlsDiv.appendChild(rotateLeftBtn);
    controlsDiv.appendChild(rotateRightBtn);
    controlsDiv.appendChild(deleteBtn);

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'cartello-content';
    
    // If we have an image path, use it
    if (item.imagePath) {
        const img = document.createElement('img');
        // Fix issue with relative paths by ensuring they are relative to the current URL
        // Remove any URL parameters from the current location for clean base URL
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        
        // If the path doesn't include http/https or doesn't start with a slash,
        // assume it's relative to the app root
        if (!item.imagePath.includes('://') && !item.imagePath.startsWith('/')) {
            img.src = new URL(item.imagePath, basePath).href;
        } else {
            img.src = item.imagePath;
        }
        
        img.alt = item.name;
        contentDiv.appendChild(img);
    } else {
        // Otherwise use icon text
        const iconDiv = document.createElement('div');
        iconDiv.className = 'cartello-icon';
        iconDiv.textContent = item.icon;
        contentDiv.appendChild(iconDiv);
        
        // Only add name if it's not a cone, table, or jump
        if (item.type !== 'cartello' && 
            !['cone', 'table', 'jump'].includes(item.id.split('_')[0])) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'cartello-name';
            nameDiv.style.fontSize = '0.6rem';
            nameDiv.textContent = item.name;
            contentDiv.appendChild(nameDiv);
        }
    }

    // Create station number if needed
    let stationNumberDiv = null;
    if (item.stationNumber) {
        stationNumberDiv = document.createElement('div');
        stationNumberDiv.className = 'station-number';
        stationNumberDiv.textContent = item.stationNumber;
    }

    // Append all elements
    div.appendChild(controlsDiv);
    div.appendChild(contentDiv);
    if (stationNumberDiv) {
        div.appendChild(stationNumberDiv);
    }

    // Add main event listeners
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(item.id);
    });

    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        removeItem(item.id);
    });

    // Make item draggable
    div.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('rotate-btn')) return;
        startDragItem(e, item.id);
    });

    document.getElementById('field').appendChild(div);
}

function rotateItemById(id, degrees) {
    console.log('rotateItemById called:', id, degrees);
    const item = config.state.placedItems.find(i => i.id === id);
    if (item) {
        item.rotation = (item.rotation + degrees) % 360;
        if (item.rotation < 0) item.rotation += 360;
        
        // Store the last rotation for future items
        config.state.lastRotation = item.rotation;
        
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.style.transform = `rotate(${item.rotation}deg)`;
            console.log('Item rotated to:', item.rotation);
        }
    } else {
        console.log('Item not found:', id);
    }
}

function startDragItem(e, itemId) {
    e.preventDefault();
    const item = config.state.placedItems.find(i => i.id === itemId);
    const element = document.querySelector(`[data-id="${itemId}"]`);
    
    if (!item || !element) return;

    const fieldRect = document.getElementById('field').getBoundingClientRect();
    const canvasArea = document.getElementById('canvasArea');
    
    const startX = e.clientX - fieldRect.left + canvasArea.scrollLeft - item.x;
    const startY = e.clientY - fieldRect.top + canvasArea.scrollTop - item.y;

    function onMouseMove(e) {
        const newX = e.clientX - fieldRect.left + canvasArea.scrollLeft - startX;
        const newY = e.clientY - fieldRect.top + canvasArea.scrollTop - startY;
        const snapped = snapToGrid(newX, newY);
        
        item.x = snapped.x;
        item.y = snapped.y;
        element.style.left = snapped.x + 'px';
        element.style.top = snapped.y + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function selectItem(id) {
    console.log('selectItem called with id:', id);
    
    // Deselect previous
    if (config.state.selectedItem) {
        console.log('Deselecting previous item:', config.state.selectedItem);
        const prev = document.querySelector(`[data-id="${config.state.selectedItem}"]`);
        if (prev) {
            prev.classList.remove('selected');
            console.log('Removed selected class from previous item');
        } else {
            console.log('Previous item not found in DOM');
        }
    }

    config.state.selectedItem = id;
    console.log('Selecting new item:', id);
    
    const element = document.querySelector(`[data-id="${id}"]`);
    if (element) {
        element.classList.add('selected');
        console.log('Added selected class to element');
        
        // Check if controls are visible
        const controls = element.querySelector('.rotation-controls');
        if (controls) {
            console.log('Controls found, display style:', window.getComputedStyle(controls).display);
        } else {
            console.log('❌ Controls not found in element');
        }
    } else {
        console.log('❌ Element not found with data-id:', id);
        // List all elements to debug
        const allElements = document.querySelectorAll('[data-id]');
        console.log('All elements with data-id:');
        allElements.forEach(el => {
            console.log('- data-id:', el.dataset.id);
        });
    }
}

function removeItem(id) {
    console.log('removeItem called with id:', id);
    
    const index = config.state.placedItems.findIndex(i => i.id === id);
    
    if (index !== -1) {
        const item = config.state.placedItems[index];
        console.log('Found item to remove:', item);
        
        // Find ALL elements with this data-id
        const elements = document.querySelectorAll(`[data-id="${id}"]`);
        console.log(`Found ${elements.length} elements with data-id="${id}"`);
        
        // Remove ALL elements with this data-id
        elements.forEach((element, i) => {
            console.log(`Removing element ${i}:`, element);
            element.parentNode.removeChild(element);
        });
        
        // Verify removal
        const stillThere = document.querySelectorAll(`[data-id="${id}"]`);
        console.log(`After removal, ${stillThere.length} elements still exist with data-id="${id}"`);

        // Remove from array
        config.state.placedItems.splice(index, 1);

        // Deselect if this was selected
        if (config.state.selectedItem === id) {
            config.state.selectedItem = null;
        }

        // Recalculate station numbers if it was a numbered station
        if (item.stationNumber) {
            recalculateStations();
        }

        updateStationCount();
        
        // Update the library to restore cartello if it was a cartello (not object)
        if (item.type === 'cartello') {
            updateCartelliGrid();
        }
        
    } else {
        console.log('❌ Item not found in array');
    }
}

function recalculateStations() {
    console.log('Recalculating stations...');
    
    // Get all station items (cartelli that should have numbers)
    const stationItems = config.state.placedItems.filter(item => 
        item.type === 'cartello' && 
        !['start', 'finish', 'bonus-start', 'bonus-finish', 'jolly'].includes(getBaseId(item.id))
    );

    console.log('Station items found:', stationItems.length);

    // Reset counter
    config.state.stationCounter = 0;

    // Assign new station numbers
    stationItems.forEach((item, index) => {
        item.stationNumber = index + 1;
        config.state.stationCounter = index + 1;
    });

    // Update all DOM elements
    config.state.placedItems.forEach(item => {
        const element = document.querySelector(`[data-id="${item.id}"]`);
        if (element) {
            // Remove existing station number
            const existingNumber = element.querySelector('.station-number');
            if (existingNumber) {
                existingNumber.remove();
            }
            
            // Add new station number if needed
            if (item.stationNumber) {
                const stationDiv = document.createElement('div');
                stationDiv.className = 'station-number';
                stationDiv.textContent = item.stationNumber;
                element.appendChild(stationDiv);
            }
        }
    });

    console.log('Stations recalculated, counter:', config.state.stationCounter);
}

function getBaseId(id) {
    // Get base ID without timestamp suffix for objects
    return id.includes('_') ? id.split('_')[0] : id;
}

function clearField() {
    console.log('clearField called');
    if (confirm('Sei sicuro di voler eliminare tutto il percorso?')) {
        console.log('User confirmed, clearing field');
        
        // Remove all placed items from DOM
        const allPlacedItems = document.querySelectorAll('.placed-item');
        console.log('Found placed items:', allPlacedItems.length);
        allPlacedItems.forEach(element => {
            element.remove();
        });
        
        // Clear the array completely
        config.state.placedItems.splice(0, config.state.placedItems.length);
        console.log('Array cleared, length:', config.state.placedItems.length);
        
        // Reset counters
        config.state.stationCounter = 0;
        config.state.selectedItem = null;
        
        // Update displays
        updateStationCount();
        updateCartelliGrid();
    }
}
