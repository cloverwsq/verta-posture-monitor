/**
 * VertA Mock Data Generator
 * 用于原型阶段的模拟数据生成
 */

class MockDataGenerator {
    constructor() {
        this.currentSession = {
            startTime: new Date(),
            totalMinutes: 0,
            postureEvents: [],
            batteryLevel: 100
        };
        
        this.userProfile = {
            name: 'Demo User',
            email: 'demo@verta.com',
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
            totalSessions: 45,
            averagePostureScore: 82,
            streak: 15,
            preferences: {
                reminderInterval: 15, // 分钟
                vibrationIntensity: 3, // 1-5
                workingHours: { start: 9, end: 17 }
            }
        };
        
        this.historicalData = this.generateHistoricalData();
    }

    /**
     * 生成5x5压力传感器数据
     */
    generateSensorData(postureType = 'good') {
        const basePatterns = {
            good: [
                [0.1, 0.2, 0.3, 0.2, 0.1],
                [0.2, 0.4, 0.6, 0.4, 0.2],
                [0.3, 0.6, 0.8, 0.6, 0.3],
                [0.2, 0.4, 0.6, 0.4, 0.2],
                [0.1, 0.2, 0.3, 0.2, 0.1]
            ],
            slouching: [
                [0.1, 0.1, 0.2, 0.1, 0.1],
                [0.2, 0.3, 0.4, 0.3, 0.2],
                [0.1, 0.2, 0.3, 0.2, 0.1],
                [0.3, 0.5, 0.7, 0.5, 0.3],
                [0.2, 0.4, 0.6, 0.4, 0.2]
            ],
            leaning_left: [
                [0.2, 0.4, 0.3, 0.1, 0.05],
                [0.4, 0.7, 0.5, 0.2, 0.1],
                [0.5, 0.8, 0.6, 0.3, 0.15],
                [0.3, 0.6, 0.4, 0.2, 0.1],
                [0.2, 0.4, 0.3, 0.1, 0.05]
            ],
            leaning_right: [
                [0.05, 0.1, 0.3, 0.4, 0.2],
                [0.1, 0.2, 0.5, 0.7, 0.4],
                [0.15, 0.3, 0.6, 0.8, 0.5],
                [0.1, 0.2, 0.4, 0.6, 0.3],
                [0.05, 0.1, 0.3, 0.4, 0.2]
            ],
            crossed_legs: [
                [0.1, 0.2, 0.2, 0.2, 0.1],
                [0.3, 0.5, 0.4, 0.5, 0.3],
                [0.2, 0.4, 0.6, 0.4, 0.2],
                [0.4, 0.7, 0.3, 0.7, 0.4],
                [0.3, 0.5, 0.2, 0.5, 0.3]
            ]
        };

        const pattern = basePatterns[postureType] || basePatterns.good;
        const sensorData = [];
        
        // 添加噪声和随机变化
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let value = pattern[i][j];
                
                // 添加高斯噪声
                value += this.gaussianRandom(0, 0.05);
                
                // 添加时间变化
                const time = Date.now() / 1000;
                value += Math.sin(time * 0.1 + i + j) * 0.02;
                
                // 确保值在合理范围内
                value = Math.max(0, Math.min(1, value));
                
                sensorData.push(value);
            }
        }
        
        return sensorData;
    }

    /**
     * 生成高斯随机数
     */
    gaussianRandom(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    /**
     * 生成用户成就数据
     */
    generateAchievements() {
        const achievements = [
            {
                id: 'perfect_week',
                title: '🔥 Perfect Week!',
                description: '7 days of good posture',
                unlocked: true,
                unlockedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                rarity: 'rare',
                points: 100,
                category: 'consistency'
            },
            {
                id: 'quick_responder',
                title: '⚡ Quick Responder',
                description: 'Fixed posture in under 5s',
                unlocked: true,
                unlockedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                rarity: 'common',
                points: 25,
                category: 'responsiveness'
            },
            {
                id: 'marathon_sitter',
                title: '🏃 Marathon Sitter',
                description: '8+ hours with good posture',
                unlocked: false,
                progress: 0.75,
                rarity: 'epic',
                points: 200,
                category: 'endurance'
            },
            {
                id: 'early_bird',
                title: '🌅 Early Bird',
                description: 'Good posture before 8 AM',
                unlocked: true,
                unlockedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                rarity: 'uncommon',
                points: 50,
                category: 'timing'
            },
            {
                id: 'consistency_king',
                title: '👑 Consistency King',
                description: '30 days streak',
                unlocked: false,
                progress: 0.5,
                rarity: 'legendary',
                points: 500,
                category: 'consistency'
            },
            {
                id: 'posture_perfectionist',
                title: '💎 Posture Perfectionist',
                description: 'Maintain 95%+ score for a full day',
                unlocked: false,
                progress: 0.8,
                rarity: 'epic',
                points: 150,
                category: 'excellence'
            },
            {
                id: 'weekend_warrior',
                title: '🎯 Weekend Warrior',
                description: 'Great posture even on weekends',
                unlocked: true,
                unlockedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                rarity: 'uncommon',
                points: 75,
                category: 'dedication'
            }
        ];
        
        return achievements;
    }

    /**
     * 生成历史数据（过去30天）
     */
    generateHistoricalData() {
        const data = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayData = this.generateDayData(date);
            data.push(dayData);
        }
        
        return data;
    }

    /**
     * 生成单日数据
     */
    generateDayData(date) {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isToday = date.toDateString() === new Date().toDateString();
        
        // 周末数据可能稍有不同
        const baseScore = isWeekend ? 75 : 82;
        const variance = isWeekend ? 15 : 12;
        
        const hourlyData = [];
        const workingHours = isWeekend ? [10, 11, 12, 14, 15, 16, 17, 18, 19, 20] : 
                                        [9, 10, 11, 12, 14, 15, 16, 17, 18];
        
        for (let hour = 0; hour < 24; hour++) {
            if ((isToday && hour > new Date().getHours()) || 
                (!isToday && !workingHours.includes(hour))) {
                hourlyData.push(null);
            } else {
                let score = baseScore + this.gaussianRandom(0, variance);
                
                // 添加真实的每日模式
                if (hour >= 9 && hour <= 11) {
                    score += 5; // 上午状态好
                }
                if (hour >= 13 && hour <= 14) {
                    score -= 8; // 午餐后困倦
                }
                if (hour >= 16 && hour <= 18) {
                    score -= 5; // 下午疲劳
                }
                if (hour >= 19) {
                    score += 3; // 晚上稍微恢复
                }
                
                hourlyData.push(Math.round(Math.max(40, Math.min(100, score))));
            }
        }
        
        const validScores = hourlyData.filter(s => s !== null);
        const averageScore = validScores.length > 0 ? 
            Math.round(validScores.reduce((a, b) => a + b) / validScores.length) : 0;
        
        return {
            date: date.toISOString().split('T')[0],
            averageScore: averageScore,
            hourlyData: hourlyData,
            totalMinutes: validScores.length * 60,
            activeMinutes: Math.round(validScores.length * 45), // 考虑休息时间
            alertsCount: Math.floor(Math.random() * 15) + 3,
            sessionCount: Math.floor(validScores.length / 3) + 1,
            bestStreak: Math.floor(Math.random() * 120) + 30, // 分钟
            improvementTips: this.generateDailyTips(averageScore)
        };
    }

    /**
     * 生成每日改善建议
     */
    generateDailyTips(score) {
        const tips = [];
        
        if (score < 70) {
            tips.push("Consider adjusting your chair height");
            tips.push("Take more frequent breaks to reset posture");
        } else if (score < 85) {
            tips.push("Great progress! Try sitting back in your chair");
            tips.push("Keep your feet flat on the floor");
        } else {
            tips.push("Excellent posture! Keep up the great work");
            tips.push("You're a posture role model!");
        }
        
        return tips;
    }

    /**
     * 生成实时姿势状态
     */
    generateRealtimeStatus() {
        const postureTypes = ['good', 'slouching', 'leaning_left', 'leaning_right', 'crossed_legs'];
        const probabilities = [0.6, 0.2, 0.1, 0.08, 0.02]; // 大部分时间保持良好姿势
        
        let randomValue = Math.random();
        let selectedPosture = 'good';
        
        for (let i = 0; i < postureTypes.length; i++) {
            randomValue -= probabilities[i];
            if (randomValue <= 0) {
                selectedPosture = postureTypes[i];
                break;
            }
        }
        
        return {
            posture: selectedPosture,
            confidence: 0.8 + Math.random() * 0.2,
            sensorData: this.generateSensorData(selectedPosture),
            timestamp: new Date().toISOString(),
            batteryLevel: Math.max(10, this.currentSession.batteryLevel - Math.random() * 0.1),
            deviceConnected: Math.random() > 0.05, // 95%连接率
            temperature: 22 + Math.random() * 3, // 环境温度
            humidity: 45 + Math.random() * 20 // 环境湿度
        };
    }

    /**
     * 生成社区/排行榜数据
     */
    generateCommunityData() {
        const usernames = [
            'PosturePro', 'StraightSpine', 'ErgonomicEagle', 'HealthyHero',
            'AlignedAce', 'BalancedBear', 'ComfortCat', 'DeskWarrior',
            'FlexibleFox', 'GoodPostureGuru', 'SpineAlign', 'ErgoExpert'
        ];
        
        const leaderboard = usernames.map((username, index) => ({
            rank: index + 1,
            username: username,
            score: Math.floor(95 - index * 1.5 - Math.random() * 3),
            streak: Math.floor(Math.random() * 30) + 5,
            totalHours: Math.floor(Math.random() * 500) + 100,
            weeklyImprovement: Math.floor((Math.random() - 0.5) * 10),
            achievements: Math.floor(Math.random() * 20) + 5,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            isOnline: Math.random() > 0.3,
            country: this.getRandomCountry()
        }));
        
        // 添加当前用户到排行榜
        const userRank = Math.floor(Math.random() * 5) + 4;
        leaderboard.splice(userRank - 1, 0, {
            rank: userRank,
            username: 'You',
            score: this.userProfile.averagePostureScore,
            streak: this.userProfile.streak,
            totalHours: 156,
            weeklyImprovement: 5,
            achievements: 7,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
            isCurrentUser: true,
            isOnline: true,
            country: 'Singapore'
        });
        
        // 重新排序排名
        leaderboard.forEach((user, index) => {
            user.rank = index + 1;
        });
        
        return {
            leaderboard: leaderboard,
            userRank: leaderboard.find(u => u.isCurrentUser)?.rank || 5,
            totalUsers: 1247,
            onlineUsers: 342,
            averageScore: 78,
            globalStats: {
                totalMinutesTracked: 2847293,
                totalAlertsDelivered: 45821,
                averageImprovementRate: 12.5 // percent
            }
        };
    }

    /**
     * 获取随机国家
     */
    getRandomCountry() {
        const countries = ['USA', 'Canada', 'UK', 'Germany', 'Japan', 'Australia', 'Singapore', 'France', 'Netherlands', 'Sweden'];
        return countries[Math.floor(Math.random() * countries.length)];
    }

    /**
     * 生成设备信息
     */
    generateDeviceInfo() {
        return {
            deviceId: 'VTA-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            modelName: 'VertA Smart Cushion Pro',
            firmwareVersion: '1.2.3',
            hardwareVersion: 'Rev C',
            serialNumber: 'VSC' + Math.random().toString(36).substr(2, 10).toUpperCase(),
            manufactureDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            lastSync: new Date(Date.now() - Math.random() * 300000), // 最近5分钟内
            batteryLevel: Math.floor(Math.random() * 100),
            batteryHealth: Math.floor(Math.random() * 20) + 80, // 80-100%
            isCharging: Math.random() > 0.8,
            chargingCycles: Math.floor(Math.random() * 200) + 50,
            sensorStatus: {
                grid: Array(25).fill(true).map(() => Math.random() > 0.02), // 98%传感器正常
                accelerometer: Math.random() > 0.01,
                gyroscope: Math.random() > 0.01,
                bluetooth: Math.random() > 0.005,
                vibrationMotor: Math.random() > 0.01,
                temperatureSensor: Math.random() > 0.05
            },
            networkInfo: {
                signalStrength: Math.floor(Math.random() * 40) - 70, // dBm
                connectionType: 'BLE 5.0',
                lastDisconnect: null,
                dataUsage: Math.floor(Math.random() * 1000) + 500 // KB
            },
            uptime: Math.floor(Math.random() * 86400), // 秒
            totalUsageHours: Math.floor(Math.random() * 1000) + 100,
            calibrationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        };
    }

    /**
     * 生成提醒和通知数据
     */
    generateNotifications() {
        const notifications = [
            {
                id: 'posture_reminder_' + Date.now(),
                type: 'reminder',
                title: 'Posture Check! 📏',
                message: 'You\'ve been slouching for 15 minutes. Time to straighten up!',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                priority: 'medium',
                actionButton: 'Dismiss',
                category: 'posture'
            },
            {
                id: 'achievement_unlock_' + Date.now(),
                type: 'achievement',
                title: 'Achievement Unlocked! 🏆',
                message: 'Early Bird - Good posture before 8 AM',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: false,
                priority: 'high',
                actionButton: 'View Achievement',
                category: 'gamification'
            },
            {
                id: 'battery_low_' + Date.now(),
                type: 'warning',
                title: 'Low Battery 🔋',
                message: 'VertA cushion battery is at 15%. Please charge soon.',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                read: true,
                priority: 'high',
                actionButton: 'Battery Tips',
                category: 'device'
            },
            {
                id: 'daily_summary_' + Date.now(),
                type: 'info',
                title: 'Daily Summary 📊',
                message: 'Great job today! Your average posture score was 87%.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                read: true,
                priority: 'low',
                actionButton: 'View Details',
                category: 'summary'
            },
            {
                id: 'firmware_update_' + Date.now(),
                type: 'update',
                title: 'Firmware Update Available 🔄',
                message: 'Version 1.2.4 includes improved posture detection.',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                read: false,
                priority: 'medium',
                actionButton: 'Update Now',
                category: 'system'
            },
            {
                id: 'weekly_report_' + Date.now(),
                type: 'report',
                title: 'Weekly Report Ready 📈',
                message: 'Your posture improved by 8% this week!',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                read: true,
                priority: 'low',
                actionButton: 'Read Report',
                category: 'analytics'
            }
        ];
        
        return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * 生成用户设置
     */
    generateUserSettings() {
        return {
            notifications: {
                postureReminders: true,
                achievementAlerts: true,
                batteryWarnings: true,
                dailySummary: true,
                weeklyReports: true,
                firmwareUpdates: true,
                vibrationIntensity: 3, // 1-5 scale
                reminderInterval: 15, // minutes
                quietHours: {
                    enabled: true,
                    start: '22:00',
                    end: '08:00'
                },
                soundEnabled: false,
                emailNotifications: true
            },
            privacy: {
                shareDataWithCommunity: true,
                allowAnalytics: true,
                publicProfile: false,
                shareAchievements: true,
                anonymousUsageData: true,
                locationTracking: false
            },
            display: {
                theme: 'auto', // light, dark, auto
                units: 'metric', // metric, imperial
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                animations: true,
                colorBlindMode: false
            },
            goals: {
                dailyMinutes: 480, // 8 hours
                targetScore: 85,
                streakGoal: 30,
                weeklyTargets: {
                    monday: 8,
                    tuesday: 8,
                    wednesday: 8,
                    thursday: 8,
                    friday: 6,
                    saturday: 2,
                    sunday: 2
                }
            },
            device: {
                autoConnect: true,
                lowPowerMode: false,
                calibrationReminder: true,
                firmwareAutoUpdate: false,
                dataSync: 'wifi_only', // wifi_only, always, manual
                backupFrequency: 'daily' // daily, weekly, monthly
            },
            advanced: {
                developerMode: false,
                debugLogging: false,
                customAlgorithm: false,
                dataExport: 'monthly',
                apiAccess: false
            }
        };
    }

    /**
     * 生成健康洞察数据
     */
    generateHealthInsights() {
        return {
            weeklyTrends: {
                postureImprovement: 12.5, // percent
                consistencyScore: 78,
                mostProductiveTime: '10:00-12:00',
                challengingTime: '14:00-16:00',
                recommendations: [
                    "Your posture is best in the morning. Try to maintain this energy throughout the day.",
                    "Consider taking a short walk during your afternoon slump.",
                    "Great consistency this week! Keep up the momentum."
                ]
            },
            riskFactors: {
                prolongedSitting: {
                    level: 'moderate',
                    weeklyAverage: 6.5, // hours per day
                    recommendation: "Try to take breaks every 30 minutes"
                },
                asymmetry: {
                    level: 'low',
                    leftRightBalance: 0.92, // ratio
                    recommendation: "Good balance! Minor left side preference detected."
                },
                forwardHeadPosture: {
                    level: 'low',
                    frequency: 0.15, // percentage of time
                    recommendation: "Excellent awareness of forward head position"
                }
            },
            improvements: {
                last30Days: {
                    scoreIncrease: 8.2,
                    alertsDecreased: 23,
                    streakImproved: 12
                },
                milestones: [
                    { date: '2024-02-15', achievement: 'First perfect day (95%+)' },
                    { date: '2024-02-20', achievement: '7-day good posture streak' },
                    { date: '2024-02-28', achievement: 'Monthly average above 85%' }
                ]
            }
        };
    }

    /**
     * 更新实时数据
     */
    updateRealtimeData() {
        this.currentSession.totalMinutes++;
        
        // 模拟电池消耗
        if (Math.random() > 0.99) {
            this.currentSession.batteryLevel = Math.max(0, this.currentSession.batteryLevel - 1);
        }
        
        return this.generateRealtimeStatus();
    }

    /**
     * 获取用户统计摘要
     */
    getUserStatsSummary() {
        return {
            totalDays: 30,
            averageScore: this.userProfile.averagePostureScore,
            currentStreak: this.userProfile.streak,
            bestStreak: 22,
            totalAlerts: 284,
            improvementRate: 12.5,
            timeSpentSitting: 156.8, // hours
            achievementsUnlocked: 4,
            rank: 12,
            percentile: 88
        };
    }
}

// 创建全局模拟数据生成器实例
const mockDataGenerator = new MockDataGenerator();

// 导出常用的数据生成函数
window.generateMockSensorData = (posture) => mockDataGenerator.generateSensorData(posture);
window.generateRealtimeStatus = () => mockDataGenerator.generateRealtimeStatus();
window.getMockHistoricalData = () => mockDataGenerator.historicalData;
window.getMockAchievements = () => mockDataGenerator.generateAchievements();
window.getMockCommunityData = () => mockDataGenerator.generateCommunityData();
window.getMockDeviceInfo = () => mockDataGenerator.generateDeviceInfo();
window.getMockNotifications = () => mockDataGenerator.generateNotifications();
window.getMockUserSettings = () => mockDataGenerator.generateUserSettings();
window.getMockHealthInsights = () => mockDataGenerator.generateHealthInsights();
window.getMockUserStats = () => mockDataGenerator.getUserStatsSummary();

// 导出完整的数据生成器
window.mockDataGenerator = mockDataGenerator;

// 高级数据生成函数
window.generateMockWorkdayPattern = () => {
    const hours = [];
    for (let h = 9; h <= 17; h++) {
        let score = 80;
        if (h === 13 || h === 14) score -= 10; // 午餐时间
        if (h >= 15) score -= 5; // 下午疲劳
        hours.push({
            hour: h,
            score: score + Math.random() * 10,
            alerts: Math.floor(Math.random() * 3)
        });
    }
    return hours;
};

window.generateMockPostureDistribution = () => {
    return {
        good: 72.3,
        slouching: 18.7,
        leaning_left: 4.2,
        leaning_right: 3.8,
        crossed_legs: 1.0
    };
};

console.log('📊 Mock data generator initialized');