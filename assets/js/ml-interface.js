/**
 * VertA ML Model Interface
 * 这个文件为ML模型集成做好了准备，目前使用模拟数据
 */

class MLPostureModel {
    constructor() {
        this.isLoaded = false;
        this.model = null;
        this.lastPrediction = null;
        this.predictionHistory = [];
        this.confidenceThreshold = 0.85;
        this.onPredictionUpdate = null;
        
        // 模型配置
        this.modelConfig = {
            inputShape: [25], // 5x5 pressure sensor grid
            outputClasses: ['good', 'slouching', 'leaning_left', 'leaning_right', 'crossed_legs'],
            confidenceThreshold: 0.85,
            inferenceTimeMs: 50
        };
        
        console.log('🧠 ML Model Interface initialized');
    }

    /**
     * 加载ML模型
     * @param {string} modelPath - 模型文件路径
     */
    async loadModel(modelPath) {
        try {
            console.log(`📥 Loading ML model from: ${modelPath}`);
            
            // TODO: 替换为实际的模型加载代码
            // 例如：TensorFlow.js
            // this.model = await tf.loadLayersModel(modelPath);
            
            // 或者：ONNX.js
            // this.model = await ort.InferenceSession.create(modelPath);
            
            // 模拟加载延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.isLoaded = true;
            console.log('✅ ML model loaded successfully');
            console.log('📋 Model config:', this.modelConfig);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to load ML model:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 预处理传感器数据
     * @param {Array} rawSensorData - 5x5压力传感器原始数据
     */
    preprocessData(rawSensorData) {
        if (!Array.isArray(rawSensorData) || rawSensorData.length !== 25) {
            throw new Error('Invalid sensor data: Expected array of 25 values');
        }

        // 数据归一化 (0-1范围)
        const maxValue = Math.max(...rawSensorData);
        const minValue = Math.min(...rawSensorData);
        const range = maxValue - minValue;
        
        const normalized = rawSensorData.map(value => 
            range === 0 ? 0 : (value - minValue) / range
        );

        // 添加滤波处理（可选）
        const filtered = this.applyLowPassFilter(normalized);

        return {
            raw: rawSensorData,
            normalized: filtered,
            timestamp: Date.now(),
            maxPressure: maxValue,
            minPressure: minValue,
            averagePressure: rawSensorData.reduce((a, b) => a + b, 0) / 25,
            metadata: {
                sensorCount: 25,
                gridSize: '5x5',
                processingTime: Date.now()
            }
        };
    }

    /**
     * 应用低通滤波器减少噪声
     * @param {Array} data - 输入数据
     */
    applyLowPassFilter(data, alpha = 0.3) {
        if (!this.lastFilteredData) {
            this.lastFilteredData = [...data];
            return data;
        }

        const filtered = data.map((value, index) => 
            alpha * value + (1 - alpha) * this.lastFilteredData[index]
        );

        this.lastFilteredData = filtered;
        return filtered;
    }

    /**
     * 执行姿势分类预测
     * @param {Array} sensorData - 传感器数据
     */
    async predict(sensorData) {
        const startTime = Date.now();
        
        try {
            // 预处理数据
            const processedData = this.preprocessData(sensorData);
            
            let prediction;
            
            if (this.isLoaded && this.model) {
                // TODO: 使用真实模型进行预测
                prediction = await this.realModelPredict(processedData);
            } else {
                // 使用模拟预测
                prediction = this.mockPredict(processedData);
            }

            // 添加性能指标
            prediction.inferenceTime = Date.now() - startTime;
            prediction.modelVersion = this.isLoaded ? '1.0.0' : 'mock';
            
            // 保存预测历史
            this.lastPrediction = prediction;
            this.predictionHistory.push(prediction);
            
            // 保持历史记录在合理范围内
            if (this.predictionHistory.length > 100) {
                this.predictionHistory = this.predictionHistory.slice(-100);
            }

            // 触发事件回调
            if (this.onPredictionUpdate && typeof this.onPredictionUpdate === 'function') {
                this.onPredictionUpdate(prediction);
            }

            return prediction;
            
        } catch (error) {
            console.error('❌ Prediction error:', error);
            return {
                posture: 'unknown',
                confidence: 0,
                error: error.message,
                timestamp: new Date().toISOString(),
                inferenceTime: Date.now() - startTime
            };
        }
    }

    /**
     * 真实模型预测（待实现）
     * @param {Object} processedData - 预处理后的数据
     */
    async realModelPredict(processedData) {
        // TODO: 实现真实的ML模型推理
        // 这里是你集成TensorFlow.js、ONNX.js或其他ML框架的地方
        
        /*
        示例 TensorFlow.js 集成:
        
        const input = tf.tensor2d([processedData.normalized], [1, 25]);
        const prediction = await this.model.predict(input);
        const probabilities = await prediction.data();
        
        const classes = ['good', 'slouching', 'leaning_left', 'leaning_right', 'crossed_legs'];
        const maxIndex = probabilities.indexOf(Math.max(...probabilities));
        const confidence = probabilities[maxIndex];
        
        input.dispose();
        prediction.dispose();
        
        return {
            posture: classes[maxIndex],
            confidence: confidence,
            probabilities: Object.fromEntries(
                classes.map((cls, i) => [cls, probabilities[i]])
            ),
            timestamp: new Date().toISOString(),
            sensorSummary: {
                maxPressure: processedData.maxPressure,
                avgPressure: processedData.averagePressure,
                pressureDistribution: this.analyzePressureDistribution(processedData.raw)
            }
        };
        */
        
        // 临时返回模拟结果
        return this.mockPredict(processedData);
    }

    /**
     * 模拟预测（用于原型阶段）
     * @param {Object} processedData - 预处理后的数据
     */
    mockPredict(processedData) {
        const { normalized, maxPressure, averagePressure } = processedData;
        
        // 基于压力分布的启发式规则
        const centerPressure = normalized[12]; // 中心点 (2,2)
        
        // 分析左右对称性
        const leftSidePressure = [];
        const rightSidePressure = [];
        
        for (let i = 0; i < 25; i++) {
            const col = i % 5;
            if (col < 2) leftSidePressure.push(normalized[i]);
            if (col > 2) rightSidePressure.push(normalized[i]);
        }
        
        const leftAvg = leftSidePressure.reduce((a, b) => a + b, 0) / leftSidePressure.length;
        const rightAvg = rightSidePressure.reduce((a, b) => a + b, 0) / rightSidePressure.length;
        const asymmetry = Math.abs(leftAvg - rightAvg);
        
        // 分析前后分布
        const frontPressure = normalized.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const backPressure = normalized.slice(15, 25).reduce((a, b) => a + b, 0) / 10;
        
        // 决策逻辑
        let posture = 'good';
        let confidence = 0.85 + Math.random() * 0.15;
        
        // 检测左右倾斜
        if (asymmetry > 0.25) {
            posture = leftAvg > rightAvg ? 'leaning_left' : 'leaning_right';
            confidence *= (0.7 + asymmetry * 0.3);
        } 
        // 检测前倾（slouching）
        else if (frontPressure > backPressure * 1.5 && centerPressure < 0.4) {
            posture = 'slouching';
            confidence *= 0.8;
        }
        // 检测交叉腿（特殊压力模式）
        else if (this.detectCrossedLegs(normalized)) {
            posture = 'crossed_legs';
            confidence *= 0.75;
        }
        // 随机引入一些变化（模拟真实场景）
        else if (Math.random() > 0.9) {
            const variations = ['slouching', 'leaning_left', 'leaning_right'];
            posture = variations[Math.floor(Math.random() * variations.length)];
            confidence *= 0.7;
        }
        
        // 生成概率分布
        const probabilities = this.generateProbabilities(posture, confidence);
        
        return {
            posture: posture,
            confidence: confidence,
            probabilities: probabilities,
            timestamp: new Date().toISOString(),
            sensorSummary: {
                maxPressure: maxPressure,
                avgPressure: averagePressure,
                centerPressure: centerPressure,
                asymmetryScore: asymmetry,
                pressureDistribution: this.analyzePressureDistribution(processedData.raw)
            },
            recommendation: this.getPostureRecommendation(posture, confidence),
            features: {
                leftRightAsymmetry: asymmetry,
                frontBackRatio: frontPressure / (backPressure + 0.001),
                centerEngagement: centerPressure,
                overallActivation: averagePressure
            }
        };
    }

    /**
     * 检测交叉腿模式
     * @param {Array} normalized - 归一化的传感器数据
     */
    detectCrossedLegs(normalized) {
        // 交叉腿通常会在特定位置产生不对称的压力模式
        const corners = [normalized[0], normalized[4], normalized[20], normalized[24]];
        const cornerSum = corners.reduce((a, b) => a + b, 0);
        
        const sides = [
            normalized[2], normalized[7], normalized[12], normalized[17], normalized[22]
        ];
        const sideSum = sides.reduce((a, b) => a + b, 0);
        
        // 如果边缘压力明显高于角落压力，可能是交叉腿
        return sideSum > cornerSum * 1.5 && Math.random() > 0.8;
    }

    /**
     * 生成概率分布
     * @param {string} predictedPosture - 预测的姿势
     * @param {number} confidence - 置信度
     */
    generateProbabilities(predictedPosture, confidence) {
        const classes = this.modelConfig.outputClasses;
        const probabilities = {};
        
        // 为预测类别分配高概率
        probabilities[predictedPosture] = confidence;
        
        // 为其他类别分配剩余概率
        const remainingProb = 1 - confidence;
        const otherClasses = classes.filter(cls => cls !== predictedPosture);
        
        otherClasses.forEach(cls => {
            probabilities[cls] = (remainingProb / otherClasses.length) * (0.5 + Math.random() * 0.5);
        });
        
        // 归一化确保总和为1
        const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
        Object.keys(probabilities).forEach(key => {
            probabilities[key] /= total;
        });
        
        return probabilities;
    }

    /**
     * 分析压力分布模式
     * @param {Array} rawData - 原始传感器数据
     */
    analyzePressureDistribution(rawData) {
        const grid = [];
        for (let i = 0; i < 5; i++) {
            grid.push(rawData.slice(i * 5, (i + 1) * 5));
        }

        // 计算压力中心
        let totalPressure = 0;
        let centerX = 0;
        let centerY = 0;

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const pressure = grid[i][j];
                totalPressure += pressure;
                centerX += pressure * j;
                centerY += pressure * i;
            }
        }

        if (totalPressure > 0) {
            centerX /= totalPressure;
            centerY /= totalPressure;
        }

        return {
            centerOfPressure: { x: centerX, y: centerY },
            totalPressure: totalPressure,
            maxPressurePoint: this.findMaxPressurePoint(grid),
            symmetryScore: this.calculateSymmetryScore(grid),
            hotspots: this.identifyHotspots(grid),
            uniformity: this.calculateUniformity(rawData)
        };
    }

    /**
     * 找到最大压力点
     * @param {Array} grid - 5x5压力网格
     */
    findMaxPressurePoint(grid) {
        let maxPressure = 0;
        let maxPoint = { x: 0, y: 0 };

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (grid[i][j] > maxPressure) {
                    maxPressure = grid[i][j];
                    maxPoint = { x: j, y: i };
                }
            }
        }

        return { ...maxPoint, pressure: maxPressure };
    }

    /**
     * 计算对称性得分
     * @param {Array} grid - 5x5压力网格
     */
    calculateSymmetryScore(grid) {
        let symmetrySum = 0;
        let totalComparisons = 0;

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 2; j++) {
                const leftValue = grid[i][j];
                const rightValue = grid[i][4 - j];
                const diff = Math.abs(leftValue - rightValue);
                const avg = (leftValue + rightValue) / 2;
                
                if (avg > 0) {
                    symmetrySum += diff / avg;
                    totalComparisons++;
                }
            }
        }

        return totalComparisons > 0 ? 1 - (symmetrySum / totalComparisons) : 1;
    }

    /**
     * 识别压力热点
     * @param {Array} grid - 5x5压力网格
     */
    identifyHotspots(grid) {
        const hotspots = [];
        const threshold = 0.6;

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (grid[i][j] > threshold) {
                    hotspots.push({
                        position: { x: j, y: i },
                        intensity: grid[i][j]
                    });
                }
            }
        }

        return hotspots.sort((a, b) => b.intensity - a.intensity);
    }

    /**
     * 计算压力均匀性
     * @param {Array} data - 传感器数据
     */
    calculateUniformity(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 归一化的均匀性分数 (0-1, 1表示完全均匀)
        return Math.max(0, 1 - standardDeviation / mean);
    }

    /**
     * 获取姿势建议
     * @param {string} posture - 检测到的姿势
     * @param {number} confidence - 置信度
     */
    getPostureRecommendation(posture, confidence) {
        const recommendations = {
            good: "Great posture! Keep it up! 👍",
            slouching: "Straighten your back and shoulders. Sit tall! 📏",
            leaning_left: "You're leaning left. Center yourself and distribute weight evenly. ⚖️",
            leaning_right: "You're leaning right. Center yourself and distribute weight evenly. ⚖️",
            crossed_legs: "Try uncrossing your legs for better circulation. 🦵",
            unknown: "Unable to determine posture. Check sensor connection. ❓"
        };

        let recommendation = recommendations[posture] || recommendations.unknown;
        
        // 添加置信度相关的建议
        if (confidence < 0.7) {
            recommendation += " (Low confidence - please adjust cushion position)";
        }

        return recommendation;
    }

    /**
     * 获取预测历史统计
     */
    getStatistics() {
        if (this.predictionHistory.length === 0) {
            return null;
        }

        const recentHistory = this.predictionHistory.slice(-50); // 最近50次预测
        const postureCounts = {};
        let totalConfidence = 0;
        let totalInferenceTime = 0;

        recentHistory.forEach(pred => {
            postureCounts[pred.posture] = (postureCounts[pred.posture] || 0) + 1;
            totalConfidence += pred.confidence;
            if (pred.inferenceTime) totalInferenceTime += pred.inferenceTime;
        });

        return {
            totalPredictions: this.predictionHistory.length,
            recentPredictions: recentHistory.length,
            averageConfidence: totalConfidence / recentHistory.length,
            averageInferenceTime: totalInferenceTime / recentHistory.length,
            postureDistribution: postureCounts,
            lastUpdateTime: this.lastPrediction?.timestamp,
            modelStatus: this.isLoaded ? 'loaded' : 'mock',
            goodPosturePercentage: ((postureCounts.good || 0) / recentHistory.length * 100).toFixed(1)
        };
    }

    /**
     * 获取模型性能指标
     */
    getPerformanceMetrics() {
        const stats = this.getStatistics();
        if (!stats) return null;

        return {
            modelVersion: this.isLoaded ? '1.0.0' : 'mock',
            averageInferenceTime: stats.averageInferenceTime,
            averageConfidence: stats.averageConfidence,
            throughput: stats.recentPredictions / (stats.recentPredictions * stats.averageInferenceTime / 1000), // predictions per second
            accuracy: stats.goodPosturePercentage, // 简化的准确率指标
            uptime: Date.now() - (this.predictionHistory[0]?.timestamp ? new Date(this.predictionHistory[0].timestamp).getTime() : Date.now())
        };
    }

    /**
     * 重置模型状态
     */
    reset() {
        this.lastPrediction = null;
        this.predictionHistory = [];
        this.lastFilteredData = null;
        console.log('🔄 ML Model state reset');
    }

    /**
     * 设置预测更新回调
     * @param {Function} callback - 预测更新时的回调函数
     */
    setOnPredictionUpdate(callback) {
        this.onPredictionUpdate = callback;
    }

    /**
     * 导出模型配置
     */
    exportConfig() {
        return {
            ...this.modelConfig,
            isLoaded: this.isLoaded,
            predictionCount: this.predictionHistory.length,
            lastPrediction: this.lastPrediction
        };
    }
}

// 全局ML模型实例
const mlModel = new MLPostureModel();

// 自动尝试加载模型（如果模型文件可用）
window.addEventListener('load', async () => {
    // TODO: 如果有模型文件，在这里加载
    // await mlModel.loadModel('/models/posture-classifier.json');
    
    console.log('🧠 ML Model interface ready for integration');
});

// 导出模型实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MLPostureModel, mlModel };
}

// 全局访问
window.MLPostureModel = MLPostureModel;
window.mlModel = mlModel;

// 开发者工具函数
window.mlDebug = {
    getStats: () => mlModel.getStatistics(),
    getPerformance: () => mlModel.getPerformanceMetrics(),
    getConfig: () => mlModel.exportConfig(),
    reset: () => mlModel.reset(),
    predict: (data) => mlModel.predict(data)
};

console.log('🧠 ML Interface module loaded');