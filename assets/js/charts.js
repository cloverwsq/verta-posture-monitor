/**
 * VertA Charts Initialization with Chart.js
 * Note: Main timeline chart is now handled by improved-timeline.js
 * This file handles other charts like weekly progress
 */

let weeklyChart;
let chartUpdateInterval;

function initCharts() {
    console.log('📊 Initializing charts...');
    
    try {
        // The main posture timeline is now handled by improved-timeline.js
        // We only initialize other charts here
        
        initWeeklyProgressChart();
        startChartUpdates();
        console.log('✅ Charts initialized successfully');
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
    }
}

function initWeeklyProgressChart() {
    const ctx = document.getElementById('weekly-chart');
    if (!ctx) {
        console.warn('Weekly chart canvas not found');
        return;
    }

    const weeklyData = generateWeeklyData();

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Daily Average Score',
                data: weeklyData,
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(78, 205, 196, 0.8)',
                    'rgba(69, 183, 209, 0.8)',
                    'rgba(150, 206, 180, 0.8)',
                    'rgba(254, 202, 87, 0.8)',
                    'rgba(255, 159, 243, 0.8)',
                    'rgba(84, 160, 255, 0.8)'
                ],
                borderColor: [
                    '#ff6b6b',
                    '#4ecdc4',
                    '#45b7d1',
                    '#96ceb4',
                    '#feca57',
                    '#ff9ff3',
                    '#54a0ff'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: '#4ecdc4',
                    borderWidth: 1,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 10,
                    callbacks: {
                        label: function(context) {
                            return `Daily Score: ${context.parsed.y}%`;
                        },
                        afterLabel: function(context) {
                            const score = context.parsed.y;
                            if (score >= 90) return '🏆 Excellent day!';
                            if (score >= 80) return '👍 Good day';
                            if (score >= 70) return '⚠️ Could be better';
                            return '❌ Needs improvement';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                }
            },
            interaction: {
                intersect: false
            },
            elements: {
                bar: {
                    borderWidth: 2
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutCubic'
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const dayIndex = element.index;
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const score = weeklyData[dayIndex];
                    
                    if (window.showToast) {
                        window.showToast(`${days[dayIndex]}: ${score}% average score`, 'info', 3000);
                    }
                }
            }
        }
    });
}

function generateWeeklyData() {
    const data = [];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayBasedToday = today === 0 ? 6 : today - 1; // Convert to Monday = 0
    
    for (let day = 0; day < 7; day++) { // Monday to Sunday
        if (day <= mondayBasedToday) {
            // 已过去的天数
            let score = 75 + Math.random() * 20; // 基础分数 75-95
            
            // 周末可能分数稍低
            if (day === 5 || day === 6) { // Saturday = 5, Sunday = 6 in Monday-based system
                score -= 5;
            }
            
            // 今天的分数稍微高一点（积极展示）
            if (day === mondayBasedToday) {
                score += 5;
            }
            
            data.push(Math.round(Math.max(60, Math.min(100, score))));
        } else {
            // 未来的天数
            data.push(null);
        }
    }
    
    return data;
}

function startChartUpdates() {
    // 每小时更新一次周图表（基于当天的表现）
    chartUpdateInterval = setInterval(() => {
        updateWeeklyChart();
    }, 60 * 60 * 1000); // 每小时
    
    console.log('📈 Chart update intervals started');
}

function updateWeeklyChart() {
    if (!weeklyChart) return;
    
    const today = new Date().getDay();
    const mondayBasedToday = today === 0 ? 6 : today - 1;
    
    // 计算今天的平均分数
    let todayScore = 80;
    
    // 如果有时间线数据，使用实际数据
    if (window.improvedTimeline) {
        const timelineData = window.improvedTimeline.getCurrentData();
        if (timelineData && timelineData.length > 0) {
            const validData = timelineData.filter(score => score !== null && score !== undefined);
            if (validData.length > 0) {
                todayScore = Math.round(validData.reduce((a, b) => a + b, 0) / validData.length);
            }
        }
    }
    
    // 或者使用ML模型的平均分数
    if (window.mlModel) {
        const stats = window.mlModel.getStatistics();
        if (stats && stats.averageConfidence) {
            todayScore = Math.round(stats.averageConfidence * 100);
        }
    }
    
    weeklyChart.data.datasets[0].data[mondayBasedToday] = todayScore;
    weeklyChart.update('none'); // 无动画更新
    
    console.log(`📊 Updated weekly chart for today: ${todayScore}%`);
}

// 手动更新图表数据
function updateWeeklyChartData(dayIndex, score) {
    if (weeklyChart && dayIndex >= 0 && dayIndex < 7) {
        weeklyChart.data.datasets[0].data[dayIndex] = Math.round(score);
        weeklyChart.update();
    }
}

// 获取周图表数据
function getWeeklyData() {
    return weeklyChart ? weeklyChart.data.datasets[0].data : null;
}

// 重置图表数据
function resetCharts() {
    if (weeklyChart) {
        weeklyChart.data.datasets[0].data = generateWeeklyData();
        weeklyChart.update();
    }
    
    console.log('🔄 Charts data reset');
}

// 销毁图表（清理资源）
function destroyCharts() {
    if (chartUpdateInterval) {
        clearInterval(chartUpdateInterval);
        chartUpdateInterval = null;
    }
    
    if (weeklyChart) {
        weeklyChart.destroy();
        weeklyChart = null;
    }
    
    console.log('🗑️ Charts destroyed');
}

// 图表动画控制
function animateChart(chart, duration = 1000) {
    if (!chart) return;
    
    chart.options.animation.duration = duration;
    chart.update('active');
}

// 导出函数
window.initCharts = initCharts;
window.updateWeeklyChartData = updateWeeklyChartData;
window.updateWeeklyChart = updateWeeklyChart;
window.getWeeklyData = getWeeklyData;
window.resetCharts = resetCharts;
window.destroyCharts = destroyCharts;
window.animateChart = animateChart;

// 为向后兼容，保留这些函数
window.initWeeklyChart = initWeeklyProgressChart;

// Chart.js 全局配置
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    
    // 注册全局插件
    Chart.register({
        id: 'vertaTheme',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            
            // 添加微妙的背景渐变
            if (chart.config.type === 'bar') {
                const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
                gradient.addColorStop(0, 'rgba(78, 205, 196, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 107, 107, 0.05)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, chart.width, chart.height);
            }
            
            ctx.restore();
        }
    });
}

console.log('📊 Charts module loaded');