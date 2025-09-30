/**
 * VertA Home Page JavaScript
 * Handles landing page functionality and navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Home page loaded');

    // Temporarily disable smooth scrolling to prevent unwanted scroll restoration
    document.documentElement.classList.add('no-scroll-restore');
    window.scrollTo(0, 0);

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    setTimeout(() => {
        document.documentElement.classList.remove('no-scroll-restore');
    }, 100);

    if (typeof init3DVisualization === 'function') init3DVisualization();
    if (typeof initAuthModal === 'function') initAuthModal();

    // 检查登录状态
    checkAuthStatus();
});

// 检查认证状态
function checkAuthStatus() {
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }

    const token = localStorage.getItem('vertaAuthToken');
    const userData = localStorage.getItem('vertaUserData');

    if (token && userData) {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }
}

// 显示Demo
function showDemo() {
    showToast('Demo feature coming soon!', 'info', 3000);
}

// 登录成功后处理
function onAuthSuccess(userData) {
    console.log('Authentication successful:', userData);

    localStorage.setItem('vertaUserData', JSON.stringify(userData));
    localStorage.setItem('vertaAuthToken', userData.token || 'demo-token');

    showToast('Welcome to VertA! Redirecting to your dashboard...', 'success', 2000);

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 滚动效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

// 阻止 hash 错误跳转
window.addEventListener('hashchange', function() {
    const validHashes = ['#features', '#how-it-works', '#pricing'];
    if (!validHashes.includes(window.location.hash)) {
        history.replaceState(null, null, window.location.pathname);
        window.scrollTo(0, 0);
    }
});

/* ------------------- 测试函数 ------------------- */

// 简单测试登录
function testLogin() {
    console.log('🧪 Testing login with demo credentials...');
    if (typeof authManager !== 'undefined') {
        authManager.handleLogin('demo@verta.com', 'password123', false);
    } else {
        console.error('❌ authManager not found');
    }
}

// Google 登录测试（⚠️ 不再清空 localStorage）
function testGoogleLogin() {
    console.log('🧪 SIMPLE Google login test...');

    const user = {
        id: 'google123',
        email: 'demo@google.com',
        firstName: 'Google',
        lastName: 'User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
    };

    const token = 'google_token_' + Date.now();

    console.log('💾 Saving auth data directly...');
    localStorage.setItem('vertaUserData', JSON.stringify(user));
    localStorage.setItem('vertaAuthToken', token);

    const saved1 = localStorage.getItem('vertaUserData');
    const saved2 = localStorage.getItem('vertaAuthToken');

    console.log('✅ Saved user:', saved1);
    console.log('✅ Saved token:', saved2);

    if (saved1 && saved2) {
        console.log('🚀 SUCCESS! Redirecting to dashboard...');
        showToast('Login successful!', 'success', 1000);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        console.error('❌ FAILED to save auth data!');
        alert('localStorage is not working!');
    }
}

// 完整测试流程（这里才允许清空）
function testCompleteFlow() {
    console.log('🧪 Testing complete login flow...');

    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 Cleared all storage (TEST MODE ONLY)');

    setTimeout(() => {
        console.log('🔗 Starting Google login simulation...');
        testGoogleLogin();
    }, 1000);
}

// 强制进入 dashboard（不会清空）
function forceStayOnDashboard() {
    console.log('🔒 Forcing stay on dashboard...');

    const fakeUser = {
        id: 'test123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
    };

    const fakeToken = 'test_token_' + Date.now();

    localStorage.setItem('vertaUserData', JSON.stringify(fakeUser));
    localStorage.setItem('vertaAuthToken', fakeToken);
    sessionStorage.removeItem('vertaLoginInProgress');

    console.log('✅ Fake auth data created');
    debugAuthState();

    console.log('🔄 Redirecting to dashboard with fake auth data');
    window.location.href = 'dashboard.html';
}

// Quick Test
function quickTest() {
    console.log('🧪 Quick test - clearing all data and creating fresh auth');
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => {
        forceStayOnDashboard();
    }, 500);
}

// 测试真实Google登录（需authManager）
function testActualGoogleLogin() {
    console.log('🧪 Testing actual Google login flow...');

    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 Cleared all storage');

    if (typeof authManager !== 'undefined') {
        console.log('🔗 Starting Google login simulation...');
        authManager.handleSocialLogin('google').then(() => {
            console.log('✅ Google login completed');
        }).catch((error) => {
            console.error('❌ Google login failed:', error);
        });
    } else {
        console.error('❌ authManager not found');
    }
}

// Debug localStorage
function debugAuthState() {
    console.log('🔍 Current localStorage contents:');
    console.log('vertaAuthToken:', localStorage.getItem('vertaAuthToken'));
    console.log('vertaUserData:', localStorage.getItem('vertaUserData'));
    console.log('vertaAuth:', localStorage.getItem('vertaAuth'));
    console.log('vertaRememberMe:', localStorage.getItem('vertaRememberMe'));
    console.log('sessionStorage vertaLoginInProgress:', sessionStorage.getItem('vertaLoginInProgress'));
    console.log('Current page:', window.location.pathname);
}

// Redirect tracker
let homeRedirectCount = 0;
const originalSetHref = function(url) {
    homeRedirectCount++;
    console.log(`🏠 HOME REDIRECT #${homeRedirectCount}: ${window.location.href} → ${url}`);
    console.trace('Home redirect stack trace:');
    debugAuthState();
};

// Export
window.showDemo = showDemo;
window.onAuthSuccess = onAuthSuccess;
window.checkAuthStatus = checkAuthStatus;
window.testLogin = testLogin;
window.testGoogleLogin = testGoogleLogin;
window.testCompleteFlow = testCompleteFlow;
window.testActualGoogleLogin = testActualGoogleLogin;
window.forceStayOnDashboard = forceStayOnDashboard;
window.quickTest = quickTest;
window.debugAuthState = debugAuthState;

console.log('🏠 Home page module loaded');
console.log('🧪 SIMPLE TEST: Call testGoogleLogin() to test login');
