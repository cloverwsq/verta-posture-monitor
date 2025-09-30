/**
 * VertA Pressure Grid Visualization
 * Simple version for dashboard functionality
 */

let pressureGridCells = [];
let gridAnimationFrame = null;

function initPressureGrid() {
    const grid = document.getElementById('pressure-grid');
    if (!grid) {
        console.warn('Pressure grid container not found');
        return;
    }

    // Clear existing content
    grid.innerHTML = '';
    pressureGridCells = [];
    
    // Create 25 sensor cells (5x5 grid)
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'pressure-cell';
        cell.dataset.index = i;
        cell.dataset.row = Math.floor(i / 5);
        cell.dataset.col = i % 5;
        
        cell.style.cssText = `
            aspect-ratio: 1;
            border-radius: 6px;
            background: rgba(78, 205, 196, 0.3);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
        `;
        
        grid.appendChild(cell);
        pressureGridCells.push({
            element: cell,
            index: i,
            row: Math.floor(i / 5),
            col: i % 5,
            lastValue: 0
        });
    }

    // Start pressure grid animation
    startPressureAnimation();
    
    console.log('🌡️ Pressure grid initialized with 25 sensors');
}

function startPressureAnimation() {
    function animate() {
        updatePressureGridVisualization();
        gridAnimationFrame = requestAnimationFrame(animate);
    }
    animate();
}

function stopPressureAnimation() {
    if (gridAnimationFrame) {
        cancelAnimationFrame(gridAnimationFrame);
        gridAnimationFrame = null;
    }
}

function updatePressureGridVisualization() {
    const grid = document.getElementById('pressure-grid');
    if (!grid || pressureGridCells.length === 0) return;

    // Generate mock sensor data
    const sensorData = generateMockSensorData();
    
    // Update each cell
    pressureGridCells.forEach((cellInfo, i) => {
        if (i >= sensorData.length) return;
        
        const cell = cellInfo.element;
        const intensity = Math.max(0, Math.min(1, sensorData[i] || 0));
        cellInfo.lastValue = intensity;
        
        // Calculate color (blue to red heatmap)
        const hue = (1 - intensity) * 240; // 240 degrees is blue, 0 degrees is red
        const saturation = 70 + intensity * 30;
        const lightness = 30 + intensity * 40;
        
        cell.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Add pulsing effect
        const pulse = 0.9 + intensity * 0.2;
        cell.style.transform = `scale(${pulse})`;
        
        // Update border and shadow
        if (intensity > 0.7) {
            cell.style.border = '2px solid rgba(255, 255, 255, 0.6)';
            cell.style.boxShadow = `0 0 12px hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
        } else if (intensity > 0.4) {
            cell.style.border = '1px solid rgba(255, 255, 255, 0.4)';
            cell.style.boxShadow = `0 0 6px hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`;
        } else {
            cell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            cell.style.boxShadow = 'none';
        }
    });
}

function generateMockSensorData() {
    const time = Date.now() / 2000;
    const data = [];
    
    for (let i = 0; i < 25; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        
        // Create center-weighted pressure distribution
        const centerDistance = Math.sqrt(Math.pow(row - 2, 2) + Math.pow(col - 2, 2));
        const centerWeight = Math.exp(-centerDistance * 0.5);
        
        // Add time variation
        const timeVariation = Math.sin(time + i * 0.2) * 0.3;
        
        let value = centerWeight * 0.7 + timeVariation + 0.2;
        value = Math.max(0, Math.min(1, value));
        
        data.push(value);
    }
    
    return data;
}

// Export functions
window.initPressureGrid = initPressureGrid;
window.updatePressureGridVisualization = updatePressureGridVisualization;
window.startPressureAnimation = startPressureAnimation;
window.stopPressureAnimation = stopPressureAnimation;

console.log('🌡️ Pressure grid module loaded');