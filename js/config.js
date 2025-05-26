// Configuration settings for Rally Obedience Course Designer

// Global configuration
const config = {
    // Level definitions
    levels: {
        L1: {
            name: 'Classe 1',
            maxStations: 15
        },
        L2: {
            name: 'Classe 2',
            maxStations: 18
        },
        L3: {
            name: 'Classe 3',
            maxStations: 20
        },
        L3B: {
            name: 'Classe 3B Extra',
            maxStations: 20
        }
    },
    
    // Application state
    state: {
        // Field parameters
        fieldWidth: 800, // pixels
        fieldHeight: 600, // pixels
        
        // Grid parameters
        gridSize: 20, // pixels between grid lines
        gridVisible: true,
        
        // Level and stations
        currentLevel: 'L1',
        stationCounter: 0,
        
        // Items on field
        placedItems: [],
        
        // Selection state
        selectedItem: null,
        
        // Drag operation data
        dragData: null,
        
        // Last used rotation (for new items)
        lastRotation: 0,
        
        // Metadata
        metadata: {
            author: "",
            creationDate: null,
            lastModified: null
        }
    }
};

// Make config globally available
window.config = config;
