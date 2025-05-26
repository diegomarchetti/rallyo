// UI control functions and event handlers

// Print the current course
function printCourse() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the field element and its contents
    const field = document.getElementById('field');
    const fieldClone = field.cloneNode(true);
    
    // Calculate the field dimensions
    const fieldStyle = window.getComputedStyle(field);
    const fieldWidth = fieldStyle.width;
    const fieldHeight = fieldStyle.height;

    // Create HTML content for the print window
    let printContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Rally Obedience - Stampa Percorso</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .field-container {
                    margin: 0 auto;
                    border: 1px solid #000;
                    position: relative;
                    width: ${fieldWidth};
                    height: ${fieldHeight};
                    background-color: white;
                    overflow: hidden;
                }
                .placed-item {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background-color: white;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .object-item {
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                }
                .placed-item img {
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                }
                .station-number {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                }
                .info-table th, .info-table td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: left;
                }
                .info-table th {
                    background-color: #f0f0f0;
                }
                .print-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 4px;
                }
                @media print {
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Percorso Rally Obedience</h1>
                <p><strong>Livello:</strong> ${config.state.currentLevel} | 
                   <strong>Stazioni:</strong> ${config.state.stationCounter}/${config.levels[config.state.currentLevel].maxStations} | 
                   <strong>Autore:</strong> ${config.state.metadata.author || "Non specificato"}
                </p>
                ${config.state.metadata.creationDate ? 
                 `<p><strong>Data creazione:</strong> ${new Date(config.state.metadata.creationDate).toLocaleDateString()}</p>` : ''}
            </div>
            <div class="field-container" id="printField"></div>
            
            <table class="info-table">
                <tr>
                    <th>Nr.</th>
                    <th>Cartello</th>
                    <th>Descrizione</th>
                </tr>
    `;
    
    // Add rows for each station in order
    const stationItems = [...config.state.placedItems]
        .filter(item => item.stationNumber)
        .sort((a, b) => a.stationNumber - b.stationNumber);
        
    const specialItems = config.state.placedItems
        .filter(item => !item.stationNumber)
        .map(item => `${item.name.toUpperCase()}`);
        
    // Add station rows
    stationItems.forEach(item => {
        printContent += `
            <tr>
                <td>${item.stationNumber}</td>
                <td>${item.id}</td>
                <td>${item.name}</td>
            </tr>
        `;
    });
    
    // Add special cartelli info
    if (specialItems.length > 0) {
        printContent += `
            <tr>
                <td colspan="3"><strong>Altri elementi:</strong> ${specialItems.join(', ')}</td>
            </tr>
        `;
    }
    
    printContent += `
            </table>
            
            <button class="print-button no-print" onclick="window.print()">🖨️ Stampa</button>
            
            <script>
                // Clone all positioned items
                const itemsData = ${JSON.stringify(config.state.placedItems)};
                
                function renderItems() {
                    const container = document.getElementById('printField');
                    
                    itemsData.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'placed-item';
                        div.style.left = item.x + 'px';
                        div.style.top = item.y + 'px';
                        div.style.transform = 'rotate(' + item.rotation + 'deg)';
                        
                        // Add object-item class for cone, jump, table objects
                        const itemType = item.id.split('_')[0]; // Get prefix before underscore
                        if (['cone', 'jump', 'table'].includes(itemType)) {
                            div.classList.add('object-item');
                        }
                        
                        // Create content
                        if (item.imagePath) {
                            const img = document.createElement('img');
                            img.src = '${window.location.href.split('/').slice(0, -1).join('/')}/' + item.imagePath;
                            img.alt = item.name;
                            div.appendChild(img);
                        } else if (item.icon) {
                            div.textContent = item.icon;
                        }
                        
                        // Add station number if exists
                        if (item.stationNumber) {
                            const numDiv = document.createElement('div');
                            numDiv.className = 'station-number';
                            numDiv.textContent = item.stationNumber;
                            div.appendChild(numDiv);
                        }
                        
                        container.appendChild(div);
                    });
                }
                
                // Initialize on load
                window.onload = renderItems;
            </script>
        </body>
        </html>
    `;
    
    // Write to the new window and close the document
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// Handle responsive design elements
window.addEventListener('resize', function() {
    // Adjust UI elements on resize if needed
    if (window.innerWidth < 1200 || window.innerHeight < 800) {
        document.getElementById('warning').classList.remove('hidden');
    } else {
        document.getElementById('warning').classList.add('hidden');
    }
});

// Function to toggle modal visibility
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// Function to close warning
function closeWarning() {
    document.getElementById('warning').classList.add('hidden');
}
