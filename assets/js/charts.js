/**
 * VertA Charts Initialization with Chart.js
 * Note: Main timeline chart is now handled by improved-timeline.js
 * This file handles other charts like weekly progress
 * Fixed: Animation, scroll issues, and container problems
 * Version: 2.0 - Container Fix
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
        console.warn('⚠️ Weekly chart canvas not found');
        return;
    }

    // 🔍 检查并确保容器正确
    let container = ctx.parentElement;
    
    // 检查父元素是否是合适的容器
    const isSuitableContainer = container && 
                                 container.tagName !== 'BODY' && 
                                 container.tagName !== 'HTML' &&
                                 (container.classList.contains('chart-container') || 
                                  container.classList.contains('chart-wrapper') ||
                                  container.id === 'weekly-chart-container');
    
    if (!isSuitableContainer) {
        console.warn('⚠️ Canvas not in proper container, creating wrapper...');
        
        // 创建合适的容器
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-container weekly-chart-container';
        wrapper.id = 'weekly-chart-container';
        
        // 将 canvas 包裹起来
        if (ctx.parentNode) {
            ctx.parentNode.insertBefore(wrapper, ctx);
            wrapper.appendChild(ctx);
        }
        
        container = wrapper;
        console.log('✅ Created proper container for weekly chart');
    }

    // 🔒 固定容器和画布尺寸（确保图表在容器内）
    if (container) {
        // === 容器样式 ===
        container.style.position = 'relative';
        container.style.minHeight = '350px';
        container.style.height = '350px';
        container.style.width = '100%';
        container.style.maxWidth = '100%';
        container.style.padding = '20px 10px';
        container.style.margin = '0 auto';
        container.style.boxSizing = 'border-box';
        container.style.overflow = 'hidden'; // ✅ 防止溢出
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        
        // === Canvas 样式 ===
        ctx.style.display = 'block';
        ctx.style.maxWidth = '100%';
        ctx.style.maxHeight = '100%';
        ctx.style.width = '100%';
        ctx.style.height = 'auto';
        
        console.log('✅ Container and canvas styles applied');
        console.log('📏 Container:', {
            tag: container.tagName,
            id: container.id,
            classes: container.className,
            width: container.offsetWidth,
            height: container.offsetHeight
        });
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
            layout: {
                padding: {
                    top: 20,
                    right: 15,
                    bottom: 10,
                    left: 15
                }
            },
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
                    max: 105,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 11
                        },
                        stepSize: 20,
                        callback: function(value) {
                            return value <= 100 ? value + '%' : '';
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
            // ✅ 完全禁用动画
            animation: {
                duration: 0
            },
            transitions: {
                active: {
                    animation: {
                        duration: 0
                    }
                }
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
    
    console.log('✅ Weekly progress chart created (scroll-safe, contained)');
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
    // 清除已存在的定时器
    if (chartUpdateInterval) {
        clearInterval(chartUpdateInterval);
    }
    
    // 每小时更新一次周图表（基于当天的表现）
    chartUpdateInterval = setInterval(() => {
        updateWeeklyChart();
    }, 60 * 60 * 1000); // 每小时
    
    console.log('📈 Chart update interval started (1 hour)');
}

function updateWeeklyChart() {
    if (!weeklyChart) return;
    
    // 🔒 保存滚动位置
    const scrollPos = window.scrollY;
    
    try {
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
        
        // 更新数据
        weeklyChart.data.datasets[0].data[mondayBasedToday] = todayScore;
        
        // ✅ 使用 'none' 模式更新，完全无动画
        weeklyChart.update('none');
        
        console.log(`📊 Updated weekly chart for today: ${todayScore}%`);
    } catch (error) {
        console.error('Error updating weekly chart:', error);
    }
    
    // 🔓 恢复滚动位置
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos);
    });
}

// 手动更新图表数据（保持滚动位置）
function updateWeeklyChartData(dayIndex, score) {
    if (!weeklyChart || dayIndex < 0 || dayIndex >= 7) return;
    
    const scrollPos = window.scrollY;
    
    weeklyChart.data.datasets[0].data[dayIndex] = Math.round(score);
    weeklyChart.update('none'); // 无动画更新
    
    // 恢复滚动位置
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos);
    });
}

// 获取周图表数据
function getWeeklyData() {
    return weeklyChart ? weeklyChart.data.datasets[0].data : null;
}

// 重置图表数据
function resetCharts() {
    if (!weeklyChart) return;
    
    const scrollPos = window.scrollY;
    
    weeklyChart.data.datasets[0].data = generateWeeklyData();
    weeklyChart.update('none');
    
    // 恢复滚动位置
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos);
    });
    
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

// 图表动画控制（一般不使用，保留向后兼容）
function animateChart(chart, duration = 0) {
    if (!chart) return;
    
    // 默认禁用动画以避免滚动问题
    chart.options.animation.duration = duration;
    chart.update(duration > 0 ? 'active' : 'none');
}

// 🔧 诊断工具：检查图表容器状态
function diagnoseChartContainer() {
    const canvas = document.getElementById('weekly-chart');
    
    if (!canvas) {
        console.error('❌ Canvas #weekly-chart not found!');
        return null;
    }
    
    const container = canvas.parentElement;
    const diagnosis = {
        canvas: {
            id: canvas.id,
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            display: window.getComputedStyle(canvas).display,
            position: window.getComputedStyle(canvas).position
        },
        container: {
            tag: container?.tagName,
            id: container?.id,
            classes: container?.className,
            width: container?.offsetWidth,
            height: container?.offsetHeight,
            overflow: container ? window.getComputedStyle(container).overflow : null,
            display: container ? window.getComputedStyle(container).display : null
        },
        isProperlyContained: container?.classList.contains('chart-container') || 
                            container?.classList.contains('chart-wrapper') ||
                            container?.id === 'weekly-chart-container',
        chartExists: !!weeklyChart,
        chartData: weeklyChart ? weeklyChart.data.datasets[0].data : null
    };
    
    console.log('📊 Chart Container Diagnosis:');
    console.table(diagnosis);
    
    if (!diagnosis.isProperlyContained) {
        console.warn('⚠️ Chart may not be properly contained!');
        console.log('💡 Tip: Run initWeeklyProgressChart() to auto-fix');
    } else {
        console.log('✅ Chart is properly contained');
    }
    
    return diagnosis;
}

// 导出函数
window.initCharts = initCharts;
window.updateWeeklyChartData = updateWeeklyChartData;
window.updateWeeklyChart = updateWeeklyChart;
window.getWeeklyData = getWeeklyData;
window.resetCharts = resetCharts;
window.destroyCharts = destroyCharts;
window.animateChart = animateChart;
window.diagnoseChartContainer = diagnoseChartContainer;

// 为向后兼容，保留这些函数
window.initWeeklyChart = initWeeklyProgressChart;

// Chart.js 全局配置
if (typeof Chart !== 'undefined') {
    // 全局字体设置
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    
    // ✅ 全局禁用动画（防止所有图表出现滚动问题）
    Chart.defaults.animation = {
        duration: 0
    };
    Chart.defaults.transitions = {
        active: {
            animation: {
                duration: 0
            }
        }
    };
    
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
    
    console.log('✅ Chart.js global animations disabled (scroll fix)');
}

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    destroyCharts();
});

console.log('📊 Charts module loaded v2.0 (scroll-safe + container-fix mode)');