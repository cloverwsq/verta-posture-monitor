/**
 * VertA Smart Cushion - Updated Main Application Logic
 */

class VertAApp {
    constructor() {
        this.isInitialized = false;
        this.sensorData = new Array(25).fill(0);
        this.currentPosture = 'good';
        this.deviceConnected = false;
        this.batteryLevel = 72;
        this.improvedTimeline = null; // 新的时间线实例
        
        console.log('🚀 VertA App initializing...');
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // 初始化各个组件
            await this.initComponents();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 启动数据模拟
            this.startDataSimulation();
            
            // 启动实时更新
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('✅ VertA App initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    /**
     * 初始化各个组件
     */
    async initComponents() {
        // 初始化3D可视化
        if (typeof init3D === 'function') {
            init3D();
            console.log('📦 3D visualization initialized');
        }

        // 初始化改进的时间线（替代旧的图表）
        if (typeof initImprovedTimeline === 'function') {
            this.improvedTimeline = initImprovedTimeline();
            console.log('📅 Improved timeline initialized');
        } else {
            // 备用：如果新时间线不可用，使用旧的图表系统
            if (typeof initCharts === 'function') {
                initCharts();
                console.log('📊 Fallback charts initialized');
            }
        }

        // 初始化压力网格
        if (typeof initPressureGrid === 'function') {
            initPressureGrid();
            console.log('🌡️ Pressure grid initialized');
        }

        // 初始化周图表（保留原有的）
        if (typeof initWeeklyChart === 'function') {
            initWeeklyChart();
            console.log('📊 Weekly chart initialized');
        }

        // 创建浮动粒子
        this.createParticles();
        console.log('✨ Particles created');

        // 尝试加载ML模型
        if (window.mlModel) {
            console.log('🧠 ML model interface ready');
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 平滑滚动导航
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // 窗口大小调整
        window.addEventListener('resize', this.handleResize.bind(this));

        // ML模型预测更新回调
        if (window.mlModel) {
            window.mlModel.onPredictionUpdate = this.handlePosturePrediction.bind(this);
        }

        console.log('👂 Event listeners set up');
    }

    /**
     * 处理窗口大小调整
     */
    handleResize() {
        // 重新调整3D画布大小
        const canvas = document.getElementById('three-canvas');
        if (canvas && window.resize3D) {
            window.resize3D();
        }

        // 调整图表大小
        if (this.improvedTimeline && this.improvedTimeline.chart) {
            this.improvedTimeline.chart.resize();
        }
    }

    /**
     * 创建浮动粒子背景
     */
    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        container.innerHTML = ''; // 清空现有粒子

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 6}s;
                animation-duration: ${Math.random() * 3 + 3}s;
            `;
            container.appendChild(particle);
        }
    }

    /**
     * 生成模拟传感器数据
     */
    generateMockSensorData() {
        const basePattern = [
            [0.1, 0.2, 0.3, 0.2, 0.1],
            [0.2, 0.4, 0.6, 0.4, 0.2],
            [0.3, 0.6, 0.8, 0.6, 0.3],
            [0.2, 0.4, 0.6, 0.4, 0.2],
            [0.1, 0.2, 0.3, 0.2, 0.1]
        ];

        // 添加随机噪声和姿势变化
        const time = Date.now() / 10000;
        const postureOffset = Math.sin(time) * 0.3;
        const noise = () => (Math.random() - 0.5) * 0.1;

        const sensorData = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let value = basePattern[i][j];
                
                // 模拟不同姿势
                if (Math.sin(time * 0.3) > 0.5) {
                    // 左倾
                    value *= (1 + (2 - j) * 0.2);
                } else if (Math.sin(time * 0.3) < -0.5) {
                    // 右倾
                    value *= (1 + (j - 2) * 0.2);
                }
                
                // 添加噪声
                value += noise();
                value = Math.max(0, Math.min(1, value));
                
                sensorData.push(value);
            }
        }

        return sensorData;
    }

    /**
     * 启动数据模拟
     */
    startDataSimulation() {
        // 模拟传感器数据更新
        setInterval(() => {
            this.sensorData = this.generateMockSensorData();
            this.processSensorData();
        }, 100); // 10Hz 更新频率

        // 模拟设备状态更新
        setInterval(() => {
            this.updateDeviceStatus();
        }, 5000); // 每5秒更新一次状态

        console.log('🔄 Data simulation started');
    }

    /**
     * 处理传感器数据
     */
    async processSensorData() {
        if (window.mlModel && this.sensorData) {
            try {
                const prediction = await window.mlModel.predict(this.sensorData);
                this.currentPosture = prediction.posture;
                
                // 更新压力网格可视化
                this.updatePressureGrid();
                
                // 更新3D可视化
                if (window.updateSensorVisualization) {
                    window.updateSensorVisualization(this.sensorData);
                }
                
            } catch (error) {
                console.error('Error processing sensor data:', error);
            }
        }
    }

    /**
     * 处理姿势预测结果
     */
    handlePosturePrediction(prediction) {
        // 更新UI状态指示器
        this.updateStatusIndicators(prediction);
        
        // 更新时间线数据（如果是当前小时）
        if (this.improvedTimeline && prediction.confidence) {
            const score = Math.round(prediction.confidence * 100);
            this.improvedTimeline.updateCurrentScore(score);
        }
        
        // 触发振动提醒（如果需要）
        if (prediction.posture !== 'good' && prediction.confidence > 0.8) {
            this.triggerHapticFeedback(prediction);
        }
        
        console.log('📍 Posture updated:', prediction.posture, `(${(prediction.confidence * 100).toFixed(1)}%)`);
    }

    /**
     * 更新状态指示器
     */
    updateStatusIndicators(prediction) {
        // 更新仪表盘状态
        const statusElements = document.querySelectorAll('.status-indicator');
        const postureTexts = document.querySelectorAll('.dashboard-card strong');
        
        // 找到姿势状态文本
        let postureStatusText = null;
        postureTexts.forEach(text => {
            if (text.textContent.includes('Posture:')) {
                postureStatusText = text;
            }
        });

        if (postureStatusText) {
            const postureLabels = {
                good: 'Excellent',
                slouching: 'Slouching',
                leaning_left: 'Leaning Left',
                leaning_right: 'Leaning Right',
                crossed_legs: 'Crossed Legs'
            };
            
            postureStatusText.textContent = `Posture: ${postureLabels[prediction.posture] || 'Unknown'}`;
        }

        // 更新指示器颜色
        statusElements.forEach((indicator, index) => {
            if (index === 0) { // 姿势指示器
                indicator.className = 'status-indicator ' + 
                    (prediction.posture === 'good' ? 'status-good' : 
                     prediction.confidence > 0.7 ? 'status-warning' : 'status-alert');
            }
        });

        // 更新主要统计卡片中的姿势分数
        const mainPostureScore = document.getElementById('posture-score');
        if (mainPostureScore && prediction.confidence) {
            const score = Math.round(prediction.confidence * 100);
            mainPostureScore.textContent = score;
        }
    }

    /**
     * 更新压力网格
     */
    updatePressureGrid() {
        if (window.updatePressureGridVisualization) {
            window.updatePressureGridVisualization();
        }
    }

    /**
     * 模拟触觉反馈
     */
    triggerHapticFeedback(prediction) {
        // 在真实设备上，这里会发送蓝牙命令到坐垫
        console.log('📳 Haptic feedback triggered for:', prediction.posture);
        
        // 浏览器振动API（如果支持）
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // 视觉反馈
        this.showVisualFeedback(prediction);
    }

    /**
     * 显示视觉反馈
     */
    showVisualFeedback(prediction) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease;
            border-left: 4px solid #ff6b6b;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;
        
        const messages = {
            slouching: '📏 Straighten your back!',
            leaning_left: '⚖️ Center yourself!',
            leaning_right: '⚖️ Center yourself!',
            crossed_legs: '🦵 Uncross your legs!'
        };
        
        feedback.textContent = messages[prediction.posture] || '📳 Posture reminder';
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.7;
        `;
        closeBtn.onclick = () => feedback.remove();
        feedback.appendChild(closeBtn);
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    /**
     * 启动实时更新
     */
    startRealTimeUpdates() {
        // 更新实时统计
        setInterval(() => {
            this.updateLiveStats();
        }, 60000); // 每分钟更新

        // 更新时间相关的显示
        setInterval(() => {
            this.updateTimeBasedElements();
        }, 1000); // 每秒更新

        console.log('⏱️ Real-time updates started');
    }

    /**
     * 更新实时统计
     */
    updateLiveStats() {
        const elements = {
            uptime: document.getElementById('uptime'),
            postureScore: document.getElementById('posture-score'),
            alertsCount: document.getElementById('alerts-count'),
            streak: document.getElementById('streak')
        };

        // 更新使用时间
        if (elements.uptime) {
            const current = parseInt(elements.uptime.textContent) || 0;
            elements.uptime.textContent = current + 1;
        }

        // 更新姿势评分（基于ML模型的置信度）
        if (elements.postureScore && window.mlModel) {
            const stats = window.mlModel.getStatistics();
            if (stats) {
                const score = Math.round(stats.averageConfidence * 100);
                elements.postureScore.textContent = score;
                
                // 同时更新时间线的分数
                if (this.improvedTimeline) {
                    this.improvedTimeline.updateCurrentScore(score);
                }
            }
        }

        // 更新提醒次数
        if (elements.alertsCount && Math.random() > 0.85) {
            const current = parseInt(elements.alertsCount.textContent) || 0;
            const newCount = current + 1;
            elements.alertsCount.textContent = newCount;
            
            // 同时更新时间线快速统计
            const alertsToday = document.getElementById('alertsToday');
            if (alertsToday) {
                alertsToday.textContent = newCount;
            }
        }

        // 偶尔更新连续天数
        if (elements.streak && Math.random() > 0.95) {
            const current = parseInt(elements.streak.textContent) || 0;
            elements.streak.textContent = current + 1;
        }
    }

    /**
     * 更新时间相关的元素
     */
    updateTimeBasedElements() {
        // 更新时间线显示
        if (this.improvedTimeline && this.improvedTimeline.updateTimeDisplay) {
            // 时间线会自动更新时间显示
        }
        
        // 更新活跃时间显示
        const activeTimeElement = document.getElementById('activeTime');
        if (activeTimeElement) {
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                const minutes = parseInt(uptimeElement.textContent) || 0;
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                activeTimeElement.textContent = `${hours}h ${remainingMinutes}m`;
            }
        }
    }

    /**
     * 更新设备状态
     */
    updateDeviceStatus() {
        // 模拟设备连接状态
        this.deviceConnected = Math.random() > 0.1; // 90%的时间保持连接
        
        // 模拟电池电量变化
        if (Math.random() > 0.9) {
            this.batteryLevel = Math.max(10, this.batteryLevel - 1);
        }

        // 更新UI
        this.updateDeviceStatusDisplay();
    }

    /**
     * 更新设备状态显示
     */
    updateDeviceStatusDisplay() {
        const deviceStatusCard = document.querySelector('.dashboard-card:first-child');
        if (!deviceStatusCard) return;

        const statusItems = deviceStatusCard.querySelectorAll('div[style*="margin-bottom"]');
        
        // 更新设备连接状态
        if (statusItems[1]) {
            const indicator = statusItems[1].querySelector('.status-indicator');
            const text = statusItems[1].querySelector('strong');
            if (indicator && text) {
                indicator.className = `status-indicator ${this.deviceConnected ? 'status-good' : 'status-alert'}`;
                text.textContent = `Device: ${this.deviceConnected ? 'Connected' : 'Disconnected'}`;
            }
        }

        // 更新电池状态
        if (statusItems[2]) {
            const indicator = statusItems[2].querySelector('.status-indicator');
            const text = statusItems[2].querySelector('strong');
            if (indicator && text) {
                const batteryClass = this.batteryLevel > 50 ? 'status-good' : 
                                   this.batteryLevel > 20 ? 'status-warning' : 'status-alert';
                indicator.className = `status-indicator ${batteryClass}`;
                text.textContent = `Battery: ${this.batteryLevel}%`;
            }
        }
    }

    /**
     * 获取应用状态
     */
    getAppState() {
        return {
            initialized: this.isInitialized,
            currentPosture: this.currentPosture,
            deviceConnected: this.deviceConnected,
            batteryLevel: this.batteryLevel,
            sensorDataLength: this.sensorData.length,
            mlModelLoaded: window.mlModel?.isLoaded || false,
            timelineActive: this.improvedTimeline !== null
        };
    }

    /**
     * 手动更新时间线数据（用于测试）
     */
    updateTimelineData(timeRange = null) {
        if (this.improvedTimeline && timeRange) {
            this.improvedTimeline.switchTimeRange(timeRange);
        }
    }

    /**
     * 手动触发姿势提醒（用于测试）
     */
    triggerTestAlert() {
        const testPrediction = {
            posture: 'slouching',
            confidence: 0.9,
            timestamp: new Date().toISOString()
        };
        this.handlePosturePrediction(testPrediction);
        this.triggerHapticFeedback(testPrediction);
    }
}

// 初始化周图表函数（保留原有功能）
function initWeeklyChart() {
    const ctx = document.getElementById('weekly-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Daily Average Score',
                data: [78, 85, 82, 89, 76, 91, 87],
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
                        callback: (value) => value + '%'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                }
            }
        }
    });
}

// 添加动画样式到文档
if (!document.querySelector('#custom-animations')) {
    const style = document.createElement('style');
    style.id = 'custom-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 创建全局应用实例
const vertaApp = new VertAApp();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM loaded, starting VertA App...');
    await vertaApp.init();
});

// 导出应用实例到全局作用域
window.vertaApp = vertaApp;
window.initWeeklyChart = initWeeklyChart;

// 开发者工具：可以在控制台调用这些函数进行测试
window.testAlert = () => vertaApp.triggerTestAlert();
window.switchTimeline = (range) => vertaApp.updateTimelineData(range);