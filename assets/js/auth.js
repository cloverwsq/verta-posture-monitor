/**
 * VertA Authentication API
 * 连接真实的 Node.js 后端
 */

// API 配置
const API_CONFIG = {
    baseURL: 'http://localhost:5000/api',
    timeout: 10000
};

// 存储键名（与 dashboard.js 保持一致）
const STORAGE_KEYS = Object.freeze({
    token: 'vertaAuthToken',
    user: 'vertaUserData',
    legacyAuth: 'vertaAuth',
    remember: 'vertaRememberMe',
    loginInProgress: 'vertaLoginInProgress'
});

// ========== API 请求封装 ==========
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = localStorage.getItem(STORAGE_KEYS.token);
    
    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ========== 注册功能 ==========
async function registerUser(name, email, password) {
    try {
        console.log('Registering user:', email);
        
        const data = await apiRequest('/register', {
            method: 'POST',
            body: { name, email, password }
        });
        
        if (data.success) {
            console.log('Registration successful:', data.user.email);
            displayToast('注册成功！请登录', 'success');
            return { success: true, user: data.user };
        } else {
            displayToast(data.message || '注册失败', 'error');
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        const message = error.message || '网络错误，请检查后端服务';
        displayToast(message, 'error');
        return { success: false, message };
    }
}

// ========== 登录功能 ==========
async function loginUser(email, password, rememberMe = false) {
    try {
        console.log('Logging in user:', email);
        
        // 清除旧数据
        clearAuthData();
        
        // 设置登录进行中标志
        sessionStorage.setItem(STORAGE_KEYS.loginInProgress, 'true');
        
        const data = await apiRequest('/login', {
            method: 'POST',
            body: { email, password }
        });
        
        if (data.success && data.token && data.user) {
            console.log('Login successful:', data.user.email);
            
            // 保存认证数据
            saveAuthData(data.token, data.user, rememberMe);
            
            displayToast('登录成功！', 'success', 1500);
            
            // 跳转到仪表板
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
            
            return { success: true, user: data.user, token: data.token };
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.loginInProgress);
            displayToast(data.message || '登录失败', 'error');
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        sessionStorage.removeItem(STORAGE_KEYS.loginInProgress);
        const message = error.message || '网络错误，请检查后端服务';
        displayToast(message, 'error');
        return { success: false, message };
    }
}

// ========== 登出功能 ==========
function logoutUser() {
    console.log('Logging out...');
    
    clearAuthData();
    displayToast('已登出', 'success', 2000);
    
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 2000);
}

// ========== 获取所有用户（测试用） ==========
async function getAllUsers() {
    try {
        const data = await apiRequest('/users');
        
        if (data.success) {
            console.log('Users retrieved:', data.count);
            return data.users;
        }
        return [];
    } catch (error) {
        console.error('Get users error:', error);
        return [];
    }
}

// ========== 辅助函数 ==========

// 保存认证数据
function saveAuthData(token, user, rememberMe = false) {
    console.log('Saving auth data...');
    
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    
    if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.remember, 'true');
    }
    
    // 移除进行中标志
    sessionStorage.removeItem(STORAGE_KEYS.loginInProgress);
    
    console.log('Auth data saved');
}

// 清除认证数据
function clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.legacyAuth);
    localStorage.removeItem(STORAGE_KEYS.remember);
    sessionStorage.clear();
}

// 检查是否已登录
function isAuthenticated() {
    return !!(localStorage.getItem(STORAGE_KEYS.token) && 
              localStorage.getItem(STORAGE_KEYS.user));
}

// 获取当前用户
function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
}

// Toast 通知（修复版，避免递归）
function displayToast(message, type = 'success', duration = 4000) {
    console.log(`Toast: ${message} (${type})`);
    
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, duration);
}

// ========== 页面加载时的处理 ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system loaded');
    
    // 绑定登录表单
    const loginForm = document.getElementById('login-form') || document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email')?.value || 
                         document.getElementById('loginEmail')?.value;
            const password = document.getElementById('login-password')?.value || 
                            document.getElementById('loginPassword')?.value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            if (email && password) {
                await loginUser(email, password, rememberMe);
            }
        });
    }
    
    // 绑定注册表单
    const registerForm = document.getElementById('register-form') || document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name')?.value || 
                        document.getElementById('registerName')?.value;
            const email = document.getElementById('register-email')?.value || 
                         document.getElementById('registerEmail')?.value;
            const password = document.getElementById('register-password')?.value || 
                            document.getElementById('registerPassword')?.value;
            
            if (name && email && password) {
                const result = await registerUser(name, email, password);
                
                // 注册成功后切换到登录表单
                if (result.success) {
                    setTimeout(() => {
                        // 关闭注册模态框，打开登录模态框
                        const registerModal = document.getElementById('register-modal') || 
                                            document.getElementById('registerModal');
                        const loginModal = document.getElementById('login-modal') || 
                                         document.getElementById('loginModal');
                        
                        if (registerModal) registerModal.style.display = 'none';
                        if (loginModal) loginModal.style.display = 'flex';
                        
                        // 预填充邮箱
                        const loginEmailInput = document.getElementById('login-email') || 
                                               document.getElementById('loginEmail');
                        if (loginEmailInput) loginEmailInput.value = email;
                    }, 1500);
                }
            }
        });
    }
    
    // 绑定登出按钮
    const logoutBtns = document.querySelectorAll('.logout-btn, [onclick*="handleLogout"]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                logoutUser();
            }
        });
    });
    
    // 检查当前页面是否需要认证
    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html') && !isAuthenticated()) {
        console.log('Dashboard accessed without authentication');
        displayToast('请先登录', 'error');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    }
});

// ========== 导出到全局 ==========
window.vertaAuth = {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated,
    getCurrentUser,
    getAllUsers
};

// 兼容旧的 authManager
window.authManager = window.authManager || {};
window.authManager.handleLogout = logoutUser;

// 提供全局 showToast
window.showToast = displayToast;

console.log('VertA Auth API ready');