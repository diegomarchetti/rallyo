// File operations: save and load functionality

function saveCourse() {
    // Ask for author name
    const authorName = prompt("Inserisci il nome dell'autore:", config.state.metadata.author || "");
    
    if (authorName === null) {
        // User cancelled
        return;
    }
    
    // Update metadata
    config.state.metadata.author = authorName;
    
    // Set or update dates
    const now = new Date();
    if (!config.state.metadata.creationDate) {
        config.state.metadata.creationDate = now;
    }
    config.state.metadata.lastModified = now;
    
    // Update author display
    document.getElementById('authorDisplay').textContent = authorName;
    
    // Create course data object
    const courseData = {
        version: 1.1,
        fieldWidth: config.state.fieldWidth,
        fieldHeight: config.state.fieldHeight,
        level: config.state.currentLevel,
        items: config.state.placedItems,
        metadata: {
            author: config.state.metadata.author,
            creationDate: config.state.metadata.creationDate ? config.state.metadata.creationDate.toISOString() : null,
            lastModified: now.toISOString()
        }
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(courseData);
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    downloadLink.download = `rally_obedience_${config.state.currentLevel}_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function loadCourse() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Parse JSON data
                const courseData = JSON.parse(e.target.result);
                
                // Clear current field
                clearFieldWithoutConfirm();
                
                // Set level
                config.state.currentLevel = courseData.level || 'L1';
                document.querySelectorAll('.level-btn').forEach(btn => {
                    if (btn.textContent === config.state.currentLevel) {
                        btn.click();
                    }
                });
                
                // Set field size
                // Handle both new pixel values and old meter values
                if (courseData.version && courseData.version >= 1.1) {
                    // New version: direct pixel values
                    config.state.fieldWidth = courseData.fieldWidth || 800;
                    config.state.fieldHeight = courseData.fieldHeight || 600;
                } else {
                    // Legacy version: convert from meters if needed
                    const isLegacyFormat = courseData.fieldWidth < 100; // Rough heuristic to detect if it's in meters
                    if (isLegacyFormat) {
                        // Convert from old meter format (assuming 20px per meter)
                        config.state.fieldWidth = courseData.fieldWidth * 20 || 800;
                        config.state.fieldHeight = courseData.fieldHeight * 20 || 600; 
                    } else {
                        config.state.fieldWidth = courseData.fieldWidth || 800;
                        config.state.fieldHeight = courseData.fieldHeight || 600;
                    }
                }
                
                // Update field size inputs
                document.getElementById('fieldWidth').value = config.state.fieldWidth;
                document.getElementById('fieldHeight').value = config.state.fieldHeight;
                
                // Load metadata if available
                if (courseData.metadata) {
                    config.state.metadata.author = courseData.metadata.author || '';
                    
                    // Parse dates if they exist
                    if (courseData.metadata.creationDate) {
                        config.state.metadata.creationDate = new Date(courseData.metadata.creationDate);
                    }
                    if (courseData.metadata.lastModified) {
                        config.state.metadata.lastModified = new Date(courseData.metadata.lastModified);
                    }
                    
                    // Show author info
                    document.getElementById('authorDisplay').textContent = config.state.metadata.author || '-';
                    
                    // Show a toast notification with metadata
                    if (config.state.metadata.author) {
                        const creationDateStr = config.state.metadata.creationDate ? 
                            config.state.metadata.creationDate.toLocaleDateString() : 'sconosciuta';
                        
                        showNotification(`Percorso creato da ${config.state.metadata.author} il ${creationDateStr}`);
                    }
                } else {
                    // No metadata found
                    config.state.metadata.author = '';
                    config.state.metadata.creationDate = null;
                    config.state.metadata.lastModified = null;
                    document.getElementById('authorDisplay').textContent = '-';
                }
                
                // Update the field display
                updateField();
                
                // Place items
                courseData.items.forEach(item => {
                    config.state.placedItems.push(item);
                    renderItem(item);
                    
                    // Update stationCounter if needed
                    if (item.stationNumber && item.stationNumber > config.state.stationCounter) {
                        config.state.stationCounter = item.stationNumber;
                    }
                });
                
                // Update UI
                updateStationCount();
                updateCartelliGrid();
                
            } catch (error) {
                console.error('Error loading course:', error);
                alert('Errore nel caricamento del percorso. Formato non valido.');
            }
        };
        reader.readAsText(file);
    });
    
    // Trigger the file input click
    fileInput.click();
}

// Display a temporary notification
function showNotification(message, duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#3498db';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add to document
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}
