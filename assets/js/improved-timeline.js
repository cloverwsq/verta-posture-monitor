/**
 * VertA Improved Timeline Visualization
 * Fixed: Prevent infinite scroll by locking chart height/aspect ratio
 */

let timelineChart = null;

function initImprovedTimeline() {
    const canvas = document.getElementById('posture-chart');
    if (!canvas) {
        console.warn('Timeline canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Generate mock timeline data
    const timelineData = generateTimelineData();
    
    // Create Chart.js timeline
    if (typeof Chart !== 'undefined') {
        timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.labels,
                datasets: [{
                    label: 'Posture Score',
                    data: timelineData.scores,
                    borderColor: 'rgba(78, 205, 196, 1)',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,   // ✅ 保持宽高比
                aspectRatio: 2,              // ✅ 宽高比 2:1
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    y: {
                        display: true,
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                }
            }
        });
    } else {
        // Fallback if Chart.js is not available
        drawSimpleTimeline(ctx, timelineData);
    }
    
    console.log('📈 Timeline chart initialized (fixed version)');
}

function generateTimelineData() {
    const labels = [];
    const scores = [];
    const now = new Date();
    
    // Generate data for the last 12 hours
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.getHours() + ':00');
        
        // Generate realistic posture scores
        const baseScore = 75 + Math.random() * 20;
        const timeVariation = Math.sin(i * 0.5) * 10;
        scores.push(Math.max(50, Math.min(100, baseScore + timeVariation)));
    }
    
    return { labels, scores };
}

function drawSimpleTimeline(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.strokeStyle = 'rgba(78, 205, 196, 1)';
    ctx.fillStyle = 'rgba(78, 205, 196, 0.1)';
    ctx.lineWidth = 2;
    
    // Draw timeline
    ctx.beginPath();
    data.scores.forEach((score, index) => {
        const x = (index / (data.scores.length - 1)) * width;
        const y = height - (score / 100) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Fill area under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

function updateTimelineChart() {
    if (timelineChart) {
        const newData = generateTimelineData();
        timelineChart.data.labels = newData.labels;
        timelineChart.data.datasets[0].data = newData.scores;
        timelineChart.update('none'); // No animation to prevent scroll issues
    }
}

// Export functions
window.initImprovedTimeline = initImprovedTimeline;
window.updateTimelineChart = updateTimelineChart;

console.log('📈 Improved timeline module loaded (fixed version)');
