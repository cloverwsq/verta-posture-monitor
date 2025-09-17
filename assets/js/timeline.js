/**
 * VertA 改进的Timeline组件 - 更好的用户体验
 */

class ImprovedTimeline {
    constructor() {
        this.currentView = 'today'; // today, week, month
        this.currentData = [];
        this.chart = null;
        this.selectedTimeRange = {
            start: new Date(),
            end: new Date()
        };
        
        console.log('📅 Improved Timeline initialized');
    }

    /**
     * 初始化改进的时间线
     */
    init() {
        this.createTimelineContainer();
        this.createChart();
        this.bindEvents();
        this.loadInitialData();
        
        return this;
    }

    /**
     * 创建时间线容器
     */
    createTimelineContainer() {
        const chartContainer = document.querySelector('.timeline-card');
        if (!chartContainer) {
            console.warn('Timeline card not found');
            return;
        }

        // 添加时间控制面板
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'timeline-controls';
        controlsDiv.innerHTML = `
            <div class="time-range-buttons">
                <button class="time-btn active" data-range="today">Today</button>
                <button class="time-btn" data-range="week">This Week</button>
                <button class="time-btn" data-range="month">This Month</button>
            </div>
            <div class="time-info">
                <div class="current-score">
                    <span class="score-label">Current Score</span>
                    <span class="score-value" id="currentScore">87%</span>
                </div>
                <div class="time-display" id="timeDisplay">Today, ${this.formatDate(new Date())}</div>
            </div>
        `;

        // 插入到图表前面
        const canvas = chartContainer.querySelector('#posture-chart');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.insertBefore(controlsDiv, canvas);
        }

        // 添加快速统计
        const statsDiv = document.createElement('div');
        statsDiv.className = 'timeline-quick-stats';
        statsDiv.innerHTML = `
            <div class="quick-stat">
                <span class="stat-icon">⏱️</span>
                <span class="stat-text">Active: <strong id="activeTime">6h 23m</strong></span>
            </div>
            <div class="quick-stat">
                <span class="stat-icon">✅</span>
                <span class="stat-text">Good Posture: <strong id="goodPostureTime" class="success">82%</strong></span>
            </div>
            <div class="quick-stat">
                <span class="stat-icon">📳</span>
                <span class="stat-text">Alerts: <strong id="alertsToday" class="warning">12</strong></span>
            </div>
        `;
        
        if (canvas && canvas.parentNode) {
            canvas.parentNode.appendChild(statsDiv);
        }
    }

    /**
     * 重新创建更好的图表
     */
    createChart() {
        const ctx = document.getElementById('posture-chart');
        if (!ctx) return;

        // 销毁旧图表
        if (this.chart) {
            this.chart.destroy();
        }

        // 创建新的改进图表
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLabelsForCurrentView(),
                datasets: [{
                    label: 'Posture Score',
                    data: this.getCurrentData(),
                    borderColor: '#4ecdc4',
                    backgroundColor: this.createGradient(ctx),
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4ecdc4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#ff6b6b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: '#4ecdc4',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 10,
                        displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                return this.formatTooltipTitle(tooltipItems[0].label);
                            },
                            label: (context) => {
                                return `Posture Score: ${context.parsed.y}%`;
                            },
                            afterLabel: (context) => {
                                return this.getPostureStatus(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(255,255,255,0.3)'
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 11
                            },
                            maxTicksLimit: this.getMaxTicks()
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        display: true,
                        grid: {
                            color: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(255,255,255,0.3)'
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 11
                            },
                            callback: (value) => value + '%',
                            stepSize: 20
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#ff6b6b'
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutCubic'
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const element = elements[0];
                        this.showDetailedInfo(element.index);
                    }
                }
            }
        });
    }

    /**
     * 创建渐变背景
     */
    createGradient(ctx) {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(78, 205, 196, 0.3)');
        gradient.addColorStop(1, 'rgba(78, 205, 196, 0.01)');
        return gradient;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 时间范围按钮
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTimeRange(e.target.dataset.range);
            });
        });
    }

    /**
     * 切换时间范围
     */
    switchTimeRange(range) {
        // 更新按钮状态
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === range);
        });

        // 更新当前视图
        this.currentView = range;

        // 更新时间显示
        this.updateTimeDisplay();

        // 重新加载数据
        this.loadDataForRange(range);

        // 更新图表
        this.updateChart();

        console.log(`📅 Switched to ${range} view`);
    }

    /**
     * 获取当前视图的标签
     */
    getLabelsForCurrentView() {
        const now = new Date();
        
        switch (this.currentView) {
            case 'today':
                return Array.from({length: 24}, (_, i) => `${i}:00`);
                
            case 'week':
                const weekLabels = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    weekLabels.push(date.toLocaleDateString('en', { weekday: 'short' }));
                }
                return weekLabels;
                
            case 'month':
                const monthLabels = [];
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const today = now.getDate();
                for (let i = 1; i <= Math.min(daysInMonth, today); i++) {
                    monthLabels.push(i.toString());
                }
                return monthLabels;
                
            default:
                return [];
        }
    }

    /**
     * 获取最大刻度数
     */
    getMaxTicks() {
        switch (this.currentView) {
            case 'today': return 12; // 每2小时一个刻度
            case 'week': return 7;   // 每天一个刻度
            case 'month': return 15; // 每2-3天一个刻度
            default: return 10;
        }
    }

    /**
     * 获取当前数据
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * 加载指定范围的数据
     */
    loadDataForRange(range) {
        switch (range) {
            case 'today':
                this.currentData = this.generateTodayData();
                break;
            case 'week':
                this.currentData = this.generateWeekData();
                break;
            case 'month':
                this.currentData = this.generateMonthData();
                break;
        }
    }

    /**
     * 生成今天的数据
     */
    generateTodayData() {
        const data = [];
        const currentHour = new Date().getHours();
        
        for (let hour = 0; hour < 24; hour++) {
            if (hour <= currentHour) {
                let score = 75 + Math.random() * 20;
                
                // 添加现实的模式
                if (hour >= 9 && hour <= 17) {
                    score += Math.sin((hour - 9) * Math.PI / 8) * 10;
                }
                if (hour >= 13 && hour <= 14) {
                    score -= 8; // 午餐时间
                }
                if (hour >= 16 && hour <= 18) {
                    score -= 5; // 下午疲劳
                }
                
                data.push(Math.max(50, Math.min(100, Math.round(score))));
            } else {
                data.push(null);
            }
        }
        return data;
    }

    /**
     * 生成本周数据
     */
    generateWeekData() {
        return [78, 85, 82, 89, 76, 91, 87].slice(0, new Date().getDay() + 1);
    }

    /**
     * 生成本月数据
     */
    generateMonthData() {
        const data = [];
        const today = new Date().getDate();
        
        for (let day = 1; day <= today; day++) {
            const score = 75 + Math.random() * 20 + Math.sin(day * 0.3) * 10;
            data.push(Math.max(60, Math.min(100, Math.round(score))));
        }
        return data;
    }

    /**
     * 更新图表
     */
    updateChart() {
        if (!this.chart) return;

        this.chart.data.labels = this.getLabelsForCurrentView();
        this.chart.data.datasets[0].data = this.getCurrentData();
        this.chart.options.scales.x.ticks.maxTicksLimit = this.getMaxTicks();
        this.chart.update('active');

        // 更新统计信息
        this.updateQuickStats();
    }

    /**
     * 更新时间显示
     */
    updateTimeDisplay() {
        const display = document.getElementById('timeDisplay');
        if (!display) return;

        const now = new Date();
        let text = '';

        switch (this.currentView) {
            case 'today':
                text = `Today, ${this.formatDate(now)}`;
                break;
            case 'week':
                text = 'This Week';
                break;
            case 'month':
                text = now.toLocaleDateString('en', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                break;
        }

        display.textContent = text;
    }

    /**
     * 更新快速统计
     */
    updateQuickStats() {
        const data = this.getCurrentData().filter(d => d !== null && d !== undefined);
        if (data.length === 0) return;

        const average = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
        const goodPosturePercent = Math.round((data.filter(d => d >= 80).length / data.length) * 100);

        // 更新显示
        const currentScore = document.getElementById('currentScore');
        const goodPostureTime = document.getElementById('goodPostureTime');
        const activeTime = document.getElementById('activeTime');

        if (currentScore) {
            currentScore.textContent = `${average}%`;
            // 根据分数设置颜色
            if (average >= 85) {
                currentScore.style.color = '#4ecdc4';
            } else if (average >= 70) {
                currentScore.style.color = '#ffd93d';
            } else {
                currentScore.style.color = '#ff6b6b';
            }
        }

        if (goodPostureTime) {
            goodPostureTime.textContent = `${goodPosturePercent}%`;
            goodPostureTime.className = goodPosturePercent >= 80 ? 'success' : 
                                       goodPosturePercent >= 60 ? 'warning' : 'danger';
        }

        if (activeTime) {
            let hours, minutes;
            switch (this.currentView) {
                case 'today':
                    hours = Math.floor(data.length * 0.8);
                    minutes = Math.floor((data.length * 0.8 % 1) * 60);
                    activeTime.textContent = `${hours}h ${minutes}m`;
                    break;
                case 'week':
                    activeTime.textContent = `${data.length} days`;
                    break;
                case 'month':
                    activeTime.textContent = `${data.length} days`;
                    break;
            }
        }
    }

    /**
     * 格式化工具提示标题
     */
    formatTooltipTitle(label) {
        switch (this.currentView) {
            case 'today':
                return `${label} Today`;
            case 'week':
                return `${label} This Week`;
            case 'month':
                return `Day ${label} This Month`;
            default:
                return label;
        }
    }

    /**
     * 获取姿势状态
     */
    getPostureStatus(score) {
        if (score >= 90) return '🏆 Excellent posture!';
        if (score >= 80) return '👍 Good posture';
        if (score >= 70) return '⚠️ Fair posture';
        return '❌ Poor posture';
    }

    /**
     * 显示详细信息
     */
    showDetailedInfo(index) {
        const score = this.currentData[index];
        if (score === null || score === undefined) return;

        const label = this.getLabelsForCurrentView()[index];
        const status = this.getPostureStatus(score);
        
        // 显示详细信息
        if (window.showToast) {
            window.showToast(`${this.formatTooltipTitle(label)}: ${score}% - ${status}`, 'info', 3000);
        }
    }

    /**
     * 加载初始数据
     */
    loadInitialData() {
        this.loadDataForRange('today');
        this.updateTimeDisplay();
        this.updateQuickStats();
    }

    /**
     * 更新当前分数 (供外部调用)
     */
    updateCurrentScore(score) {
        const currentScoreElement = document.getElementById('currentScore');
        if (currentScoreElement) {
            currentScoreElement.textContent = `${score}%`;
            
            // 根据分数设置颜色
            if (score >= 85) {
                currentScoreElement.style.color = '#4ecdc4';
            } else if (score >= 70) {
                currentScoreElement.style.color = '#ffd93d';
            } else {
                currentScoreElement.style.color = '#ff6b6b';
            }
        }
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        return date.toLocaleDateString('en', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    /**
     * 获取图表实例 (供外部访问)
     */
    getChart() {
        return this.chart;
    }

    /**
     * 销毁时间线
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // 移除事件监听器
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.removeEventListener('click', this.switchTimeRange);
        });
        
        console.log('📅 Timeline destroyed');
    }
}

// 初始化改进的时间线
function initImprovedTimeline() {
    const timeline = new ImprovedTimeline();
    const instance = timeline.init();
    
    // 将实例保存到全局，便于其他地方使用
    window.improvedTimeline = instance;
    
    return instance;
}

// 替换原来的图表初始化
function initPostureChart() {
    // 这个函数现在由 ImprovedTimeline 处理
    console.log('📈 Using improved timeline instead of basic chart');
    return initImprovedTimeline();
}

// 导出到全局
window.initImprovedTimeline = initImprovedTimeline;
window.initPostureChart = initPostureChart;
window.ImprovedTimeline = ImprovedTimeline;