/**
 * VertA Dashboard JavaScript
 * Fixed: Infinite auto-scroll issue in Posture Timeline
 */

// Global variables for update intervals
let dashboardUpdateIntervals = {
    stats: null,
    charts: null
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard loaded');
    
    const token = localStorage.getItem('vertaAuthToken');
    const userData = localStorage.getItem('vertaUserData');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            updateUserProfile(user);
            initDashboard();
        } catch (e) {
            console.error('❌ Error parsing user data:', e);
            redirectToHome('Invalid user data');
        }
    } else {
        console.log('❌ No auth data found');
        redirectToHome('No authentication');
    }
});

// Redirect if not logged in
function redirectToHome(reason) {
    console.log(`🔄 Redirecting to home: ${reason}`);
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize dashboard components
function initDashboard() {
    if (typeof initCharts === 'function') initCharts();
    if (typeof initPressureGrid === 'function') initPressureGrid();
    if (typeof initImprovedTimeline === 'function') initImprovedTimeline();
    if (typeof initMLInterface === 'function') initMLInterface();

    startDashboardUpdates();
    console.log('✅ Dashboard components initialized');
}

// Update user profile
function updateUserProfile(userData) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName && userData.firstName && userData.lastName) {
        profileName.textContent = `${userData.firstName} ${userData.lastName}`;
    }
    if (profileEmail && userData.email) {
        profileEmail.textContent = userData.email;
    }
    if (profileAvatar && userData.email) {
        profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`;
    }
}

// Start updates
function startDashboardUpdates() {
    stopDashboardUpdates();
    dashboardUpdateIntervals.stats = setInterval(updateDashboardStats, 5000);
    dashboardUpdateIntervals.charts = setInterval(updateDashboardCharts, 30000);
    console.log('🔄 Real-time updates started');
}

// Stop updates
function stopDashboardUpdates() {
    if (dashboardUpdateIntervals.stats) clearInterval(dashboardUpdateIntervals.stats);
    if (dashboardUpdateIntervals.charts) clearInterval(dashboardUpdateIntervals.charts);
}

// Update stats
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

// 🚀 Fixed: Update charts without forcing scroll
function updateDashboardCharts() {
    try {
        if (typeof updatePressureGridVisualization === 'function') {
            updatePressureGridVisualization();
        }
        if (typeof updateTimelineChart === 'function') {
            updateTimelineChart();
        }
        console.log('📈 Charts updated');
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Manual refresh
function refreshCharts() {
    showToast('Refreshing charts...', 'info', 2000);
    updateDashboardCharts();
}

// Profile dropdown functionality
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Profile actions
function showProfile() {
    if (typeof showToast === 'function') {
        showToast('Profile settings coming soon!', 'info', 3000);
    } else {
        alert('Profile settings coming soon!');
    }
    toggleProfileDropdown();
}

function showSettings() {
    if (typeof showToast === 'function') {
        showToast('Settings panel coming soon!', 'info', 3000);
    } else {
        alert('Settings panel coming soon!');
    }
    toggleProfileDropdown();
}

function showNotifications() {
    if (typeof showToast === 'function') {
        showToast('Notifications panel coming soon!', 'info', 3000);
    } else {
        alert('Notifications panel coming soon!');
    }
    toggleProfileDropdown();
}

// Export globals
window.refreshCharts = refreshCharts;
window.stopDashboardUpdates = stopDashboardUpdates;
window.startDashboardUpdates = startDashboardUpdates;
window.redirectToHome = redirectToHome;
window.toggleProfileDropdown = toggleProfileDropdown;
window.showProfile = showProfile;
window.showSettings = showSettings;
window.showNotifications = showNotifications;

console.log('✅ Dashboard module loaded (scroll bug fixed)');
