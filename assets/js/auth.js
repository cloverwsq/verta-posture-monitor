/**
 * VertA Dashboard JavaScript
 * Handles dashboard functionality and user interface
 * Fixed: Auto-scrolling issue in weekly progress chart
 */

// ==== Storage key constants (统一键名，避免拼写不一致) ====
const STORAGE_KEYS = Object.freeze({
    token: 'vertaAuthToken',
    user: 'vertaUserData',
    legacyAuth: 'vertaAuth',
    remember: 'vertaRememberMe',
    loginInProgress: 'vertaLoginInProgress'
});

// ==== URL helpers（使用绝对路径，避免相对路径跳错目录） ====
function toAbsolute(path) {
    return new URL(path, `${location.origin}/`).href;
}
const DASHBOARD_URL = toAbsolute('/dashboard.html');
const HOME_URL = toAbsolute('/index.html');

// Global variables for update intervals
let dashboardUpdateIntervals = { stats: null, charts: null };

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    console.log('📊 Dashboard loaded');
    console.log('🌐 Origin:', location.origin, ' Path:', location.pathname);

    // 第一次快速检查 + 兼容旧格式
    const ok = ensureAuthDataPresent();

    if (ok) {
        try {
            const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
            console.log('👤 User:', user?.email);
            updateUserProfile(user);
            initDashboard();
        } catch (e) {
            console.error('❌ Error parsing user data:', e);
            redirectToHome('Invalid user data');
        }
        return;
    }

    // 如果登录流程刚置位了“进行中”标志，给一次极短重检机会（50ms）
    if (sessionStorage.getItem(STORAGE_KEYS.loginInProgress) === 'true') {
        console.log('⏳ Login flag detected, rechecking shortly...');
        setTimeout(() => {
            if (ensureAuthDataPresent()) {
                try {
                    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
                    console.log('👤 User:', user?.email, '(after short wait)');
                    updateUserProfile(user);
                    initDashboard();
                } catch (e) {
                    console.error('❌ Error parsing user data after wait:', e);
                    redirectToHome('Invalid user data');
                }
            } else {
                redirectToHome('No authentication (after wait)');
            }
        }, 50);
    } else {
        redirectToHome('No authentication');
    }
});

// 简单的重定向函数（使用绝对路径）
function redirectToHome(reason) {
    console.log(`🔄 Redirecting to home: ${reason}`);
    setTimeout(() => {
        window.location.replace(HOME_URL);
    }, 100);
}

// 确保能读到 token/user；同时兼容 legacy 格式（vertaAuth）
function ensureAuthDataPresent() {
    let token = localStorage.getItem(STORAGE_KEYS.token);
    let userStr = localStorage.getItem(STORAGE_KEYS.user);

    console.log('🔍 Immediate auth check:');
    console.log('- Token exists:', !!token, ' value:', token);
    console.log('- User data exists:', !!userStr);

    if (token && userStr) return true;

    // 尝试从 legacy 结构回填
    const legacyStr = localStorage.getItem(STORAGE_KEYS.legacyAuth);
    if (legacyStr) {
        try {
            const legacy = JSON.parse(legacyStr);
            if (legacy?.token && legacy?.user) {
                console.log('♻️ Hydrating from legacy auth...');
                localStorage.setItem(STORAGE_KEYS.token, legacy.token);
                localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(legacy.user));
                token = legacy.token;
                userStr = JSON.stringify(legacy.user);
            }
        } catch { /* ignore */ }
    }

    // 防止有人曾经错拼成 "vertalAuthToken"
    const typoToken = localStorage.getItem('vertalAuthToken');
    const typoUser = localStorage.getItem('vertalUserData');
    if (!token && typoToken) {
        console.warn('✏️ Found typo key vertalAuthToken, migrating to correct key');
        localStorage.setItem(STORAGE_KEYS.token, typoToken);
    }
    if (!userStr && typoUser) {
        console.warn('✏️ Found typo key vertalUserData, migrating to correct key');
        localStorage.setItem(STORAGE_KEYS.user, typoUser);
    }

    token = localStorage.getItem(STORAGE_KEYS.token);
    userStr = localStorage.getItem(STORAGE_KEYS.user);

    return !!(token && userStr);
}

// 简化的认证检查（调试用）
function checkDashboardAuth() {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    console.log('🔐 Simple auth check:', { hasToken: !!token, hasUserData: !!userData, token, userData });
    return !!(token && userData);
}

// Initialize all dashboard components
function initDashboard() {
    if (typeof initCharts === 'function') initCharts();
    if (typeof initPressureGrid === 'function') initPressureGrid();
    if (typeof initImprovedTimeline === 'function') initImprovedTimeline();
    if (typeof initMLInterface === 'function') initMLInterface();

    startDashboardUpdates();
    console.log('✅ Dashboard components initialized');
}

// Update user profile information
function updateUserProfile(userData) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileName && userData?.firstName && userData?.lastName) {
        profileName.textContent = `${userData.firstName} ${userData.lastName}`;
    }
    if (profileEmail && userData?.email) {
        profileEmail.textContent = userData.email;
    }
    if (profileAvatar && userData?.email) {
        profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.email)}`;
    }
}

// Start/Stop updates
function startDashboardUpdates() {
    stopDashboardUpdates();
    dashboardUpdateIntervals.stats = setInterval(updateDashboardStats, 5000);
    dashboardUpdateIntervals.charts = setInterval(updateDashboardCharts, 30000);
    console.log('🔄 Real-time updates started (Stats: 5s, Charts: 30s)');
}
function stopDashboardUpdates() {
    if (dashboardUpdateIntervals.stats) { clearInterval(dashboardUpdateIntervals.stats); dashboardUpdateIntervals.stats = null; }
    if (dashboardUpdateIntervals.charts) { clearInterval(dashboardUpdateIntervals.charts); dashboardUpdateIntervals.charts = null; }
    console.log('⏸️ Real-time updates stopped');
}

// Update dashboard statistics
function updateDashboardStats() {
    const uptimeElement = document.getElementById('uptime');
    if (uptimeElement) {
        const currentUptime = parseInt(uptimeElement.textContent) || 0;
        uptimeElement.textContent = currentUptime + Math.floor(Math.random() * 3);
    }
    const postureScoreElement = document.getElementById('posture-score');
    if (postureScoreElement) {
        const variation = Math.floor(Math.random() * 6) - 3;
        const currentScore = parseInt(postureScoreElement.textContent) || 87;
        const newScore = Math.max(0, Math.min(100, currentScore + variation));
        postureScoreElement.textContent = newScore;
    }
    const alertsElement = document.getElementById('alerts-count');
    if (alertsElement && Math.random() < 0.3) {
        const currentAlerts = parseInt(alertsElement.textContent) || 0;
        alertsElement.textContent = currentAlerts + 1;
    }
}

// Update charts with scroll preservation
function updateDashboardCharts() {
    const scrollPos = window.scrollY;
    const scrollElement = document.scrollingElement || document.documentElement;
    try {
        if (typeof updatePressureGridVisualization === 'function') updatePressureGridVisualization();
        if (typeof updateTimelineChart === 'function') updateTimelineChart();
        console.log('📈 Charts updated');
    } catch (error) {
        console.error('Error updating charts:', error);
    }
    window.scrollTo(0, scrollPos);
    requestAnimationFrame(() => { window.scrollTo(0, scrollPos); scrollElement.scrollTop = scrollPos; });
    setTimeout(() => { if (Math.abs(window.scrollY - scrollPos) > 5) window.scrollTo(0, scrollPos); }, 50);
}

// Manual chart refresh
function refreshCharts() {
    console.log('🔄 Manual chart refresh triggered');
    showToast?.('Refreshing charts...', 'info', 2000);
    updateDashboardCharts();
}

// Profile dropdown
function toggleProfileDropdown() { document.getElementById('profileDropdown')?.classList.toggle('hidden'); }
function showProfile() { showToast?.('Profile settings coming soon!', 'info', 3000); toggleProfileDropdown(); }
function showSettings() { showToast?.('Settings panel coming soon!', 'info', 3000); toggleProfileDropdown(); }
function showNotifications() { showToast?.('Notifications panel coming soon!', 'info', 3000); toggleProfileDropdown(); }

// Close dropdown
document.addEventListener('click', function (event) {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        if (!profileAvatar || (!profileAvatar.contains(event.target) && !profileDropdown.contains(event.target))) {
            profileDropdown.classList.add('hidden');
        }
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        console.log('👁️ Tab hidden - pausing updates');
        stopDashboardUpdates();
    } else {
        console.log('👁️ Tab visible - resuming updates');
        if (checkDashboardAuth()) {
            startDashboardUpdates();
            updateDashboardCharts();
        }
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function () {
    stopDashboardUpdates();
});

// Debug helpers
function debugAuthState() {
    console.log('🔍 Current localStorage contents:');
    console.log(STORAGE_KEYS.token + ':', localStorage.getItem(STORAGE_KEYS.token));
    console.log(STORAGE_KEYS.user + ':', localStorage.getItem(STORAGE_KEYS.user));
    console.log(STORAGE_KEYS.legacyAuth + ':', localStorage.getItem(STORAGE_KEYS.legacyAuth));
    console.log(STORAGE_KEYS.remember + ':', localStorage.getItem(STORAGE_KEYS.remember));
    console.log('session', STORAGE_KEYS.loginInProgress + ':', sessionStorage.getItem(STORAGE_KEYS.loginInProgress));
    console.log('Current page:', window.location.pathname, ' URL:', window.location.href);
}

// Test (不再 clear 全局，避免误删其他键)
function setTestAuthData() {
    console.log('🧪 Setting test auth data...');
    const testUser = { id: 'test123', email: 'test@dashboard.com', firstName: 'Dashboard', lastName: 'Test', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dashboard' };
    const testToken = 'dashboard_test_token_' + Date.now();
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(testUser));
    localStorage.setItem(STORAGE_KEYS.token, testToken);
    console.log('✅ Saved user data/token. Reloading...');
    window.location.reload();
}

// Redirect tracking
let redirectCount = 0;
function trackRedirect(url, source) {
    redirectCount++;
    console.log(`🔄 REDIRECT #${redirectCount} from ${source}: ${window.location.href} → ${url}`);
    debugAuthState();
}

// 简单的authManager对象
const authManager = {
    handleLogout: function() {
        console.log('🚪 Logging out...');
        
        // 清除所有认证数据
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.legacyAuth);
        localStorage.removeItem(STORAGE_KEYS.remember);
        sessionStorage.clear();
        
        showToast('Signed out successfully', 'success', 2000);
        
        // 重定向到首页
        setTimeout(() => {
            window.location.href = HOME_URL;
        }, 2000);
    },
    
    handleSocialLogin: function(provider) {
        console.log(`🔗 Starting ${provider} login...`);
        
        // 清除所有数据
        localStorage.clear();
        sessionStorage.clear();
        
        // 直接创建认证数据
        const user = {
            id: provider + '123',
            email: `demo@${provider}.com`,
            firstName: 'Social',
            lastName: 'User',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
        };
        
        const token = `${provider}_token_` + Date.now();
        
        console.log('💾 Saving auth data directly...');
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.token, token);
        
        // 验证保存
        const saved1 = localStorage.getItem(STORAGE_KEYS.user);
        const saved2 = localStorage.getItem(STORAGE_KEYS.token);
        
        if (saved1 && saved2) {
            console.log('🚀 SUCCESS! Redirecting to dashboard...');
            showToast('Login successful!', 'success', 1000);
            setTimeout(() => {
                window.location.href = DASHBOARD_URL;
            }, 1000);
        } else {
            console.error('❌ FAILED to save auth data!');
            showToast('Login failed!', 'error');
        }
    }
};

// 简单的handleLogout函数
function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        authManager.handleLogout();
    }
}

// 简单的showToast函数
function showToast(message, type = 'success', duration = 4000) {
    console.log(`🍞 Toast: ${message} (${type})`);
    
    // 创建简单的toast元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, duration);
}

// 简单的模态框函数
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (!modal) {
        console.warn('Auth modal not found');
        return;
    }
    
    if (mode === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Export functions
window.authManager = authManager;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.socialLogin = (provider) => authManager.handleSocialLogin(provider);
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

console.log('🔐 Simple authentication system loaded');

