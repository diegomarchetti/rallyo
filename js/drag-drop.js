// Drag and drop functionality and field item manipulation

function handleDragStart(e) {
    const target = e.currentTarget;
    config.state.dragData = {
        type: target.dataset.type,
        id: target.dataset.id || target.dataset.type
    };

    // Extract additional info
    if (target.dataset.type === 'cartello') {
        // Find the cartello in our data
        let cartello = null;
        
        // Search in all cartelli collections based on the new structure
        cartello = cartelli.base.find(c => c.id === target.dataset.id);
        
        // Check if it's the jolly cartello
        if (!cartello && target.dataset.id === 'jolly') {
            cartello = cartelli.jolly;
        }
        
        // If not found in base or jolly, check in the appropriate level collections
        if (!cartello) {
            if (config.state.currentLevel === 'L3B') {
                // Search in L3B cartelli
                cartello = cartelli.L3B.find(c => c.id === target.dataset.id);
            } else {
                // Search in regular cartelli collections
                if (cartelli.regular.L1) {
                    cartello = cartelli.regular.L1.find(c => c.id === target.dataset.id);
                }
                
                if (!cartello && cartelli.regular.L2 && 
                    (config.state.currentLevel === 'L2' || config.state.currentLevel === 'L3')) {
                    cartello = cartelli.regular.L2.find(c => c.id === target.dataset.id);
                }
                
                if (!cartello && cartelli.regular.L3 && config.state.currentLevel === 'L3') {
                    cartello = cartelli.regular.L3.find(c => c.id === target.dataset.id);
                }
                
                // Search in bonus cartelli
                if (!cartello) {
                    if (config.state.currentLevel === 'L1' && cartelli.bonus.L1) {
                        cartello = cartelli.bonus.L1.find(c => c.id === target.dataset.id);
                    } else if (config.state.currentLevel === 'L2' && cartelli.bonus.L2) {
                        cartello = cartelli.bonus.L2.find(c => c.id === target.dataset.id);
                    } else if (config.state.currentLevel === 'L3' && cartelli.bonus.L3) {
                        cartello = cartelli.bonus.L3.find(c => c.id === target.dataset.id);
                    }
                }
            }
        }
        
        if (cartello) {
            config.state.dragData.name = cartello.name;
            config.state.dragData.imagePath = cartello.imagePath;
        } else {
            // Fallback if we can't find the cartello
            config.state.dragData.name = target.querySelector('.cartello-name').textContent;
            const iconElement = target.querySelector('.cartello-icon');
            const imgElement = iconElement.querySelector('img');
            
            if (imgElement) {
                config.state.dragData.imagePath = imgElement.src;
            } else {
                config.state.dragData.icon = iconElement.textContent;
            }
        }
    } else {
        // For objects, get data directly from the DOM
        config.state.dragData.name = target.querySelector('.cartello-name').textContent;
        
        // Set image paths for special objects
        if (target.dataset.id === 'cone') {
            config.state.dragData.imagePath = 'ASSETS/CONO.png';
        } else if (target.dataset.id === 'jump') {
            config.state.dragData.imagePath = 'ASSETS/SALTO.png';
        } else if (target.dataset.id === 'table') {
            config.state.dragData.imagePath = 'ASSETS/TAVOLO.png';
        } else {
            config.state.dragData.icon = target.querySelector('.cartello-icon').textContent;
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (!config.state.dragData) return;

    const rect = document.getElementById('field').getBoundingClientRect();
    const canvasRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position relative to the field (not the canvas area)
    const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;

    // Make sure the drop is within the field
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const snapped = snapToGrid(x, y);
        placeItem(config.state.dragData, snapped.x, snapped.y);
    }
    
    config.state.dragData = null;
}

function snapToGrid(x, y) {
    const gridPixels = config.state.gridSize;
    return {
        x: Math.round(x / gridPixels) * gridPixels,
        y: Math.round(y / gridPixels) * gridPixels
    };
}

function placeItem(data, x, y) {
    console.log('Placing item:', data, 'at', x, y);
    
    // Check if cartello already exists (objects can be placed multiple times)
    if (data.type === 'cartello' && data.id !== 'jolly' && config.state.placedItems.find(item => item.id === data.id)) {
        alert('Questo cartello è già stato utilizzato!');
        return;
    }

    // Special case for JOLLY - only one instance allowed
    if (data.id === 'jolly' && config.state.placedItems.filter(item => item.id === 'jolly').length > 0) {
        alert('Il cartello JOLLY può essere utilizzato una sola volta!');
        return;
    }

    // Generate unique ID for objects
    const itemId = data.type === 'cartello' ? data.id : `${data.id}_${Date.now()}`;

    const item = {
        id: itemId,
        type: data.type,
        name: data.name,
        imagePath: data.imagePath,
        icon: data.icon, // Kept for backward compatibility with objects
        x: x,
        y: y,
        rotation: config.state.lastRotation || 0, // Use last rotation if available
        stationNumber: null
    };

    // Assign station number for cartelli (except special ones)
    if (data.type === 'cartello' && !['start', 'finish', 'bonus-start', 'bonus-finish', 'jolly'].includes(data.id)) {
        config.state.stationCounter++;
        item.stationNumber = config.state.stationCounter;
        console.log('Assigned station number:', config.state.stationCounter, 'to', data.name);
    }

    config.state.placedItems.push(item);
    console.log('Item added to array, total items:', config.state.placedItems.length);
    
    renderItem(item);
    updateStationCount();
    
    // Update the library to remove used cartelli
    if (data.type === 'cartello') {
        updateCartelliGrid();
    }
}

function handleCanvasClick(e) {
    if (e.target === e.currentTarget || e.target.id === 'field' || e.target.id === 'gridSvg') {
        if (config.state.selectedItem) {
            const element = document.querySelector(`[data-id="${config.state.selectedItem}"]`);
            if (element) element.classList.remove('selected');
            config.state.selectedItem = null;
        }
    }
}
