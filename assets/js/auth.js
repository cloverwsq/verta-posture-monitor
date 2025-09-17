/**
 * VertA Authentication System
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.authToken = null;
        
        // 检查本地存储的登录状态
        this.checkStoredAuth();
        
        console.log('🔐 Auth Manager initialized');
    }

    /**
     * 检查本地存储的认证信息
     */
    checkStoredAuth() {
        const storedAuth = localStorage.getItem('vertaAuth');
        const rememberMe = localStorage.getItem('vertaRememberMe');
        
        if (storedAuth && rememberMe === 'true') {
            try {
                const authData = JSON.parse(storedAuth);
                if (this.isValidAuthData(authData)) {
                    this.setAuthenticatedState(authData);
                    console.log('👤 User automatically logged in');
                }
            } catch (error) {
                console.error('Error parsing stored auth:', error);
                this.clearStoredAuth();
            }
        }
    }

    /**
     * 验证认证数据的有效性
     */
    isValidAuthData(authData) {
        const requiredFields = ['user', 'token', 'expires'];
        return requiredFields.every(field => authData.hasOwnProperty(field)) &&
               new Date(authData.expires) > new Date();
    }

    /**
     * 设置认证状态
     */
    setAuthenticatedState(authData) {
        this.currentUser = authData.user;
        this.authToken = authData.token;
        this.isLoggedIn = true;
        
        // 更新UI
        this.updateAuthUI();
    }

    /**
     * 清除存储的认证信息
     */
    clearStoredAuth() {
        localStorage.removeItem('vertaAuth');
        localStorage.removeItem('vertaRememberMe');
    }

    /**
     * 处理登录
     */
    async handleLogin(email, password, rememberMe = false) {
        try {
            // 显示加载状态
            this.setLoadingState(true);
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 模拟登录验证
            const loginResult = this.mockLogin(email, password);
            
            if (loginResult.success) {
                const authData = {
                    user: loginResult.user,
                    token: loginResult.token,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天
                };
                
                // 保存认证信息
                if (rememberMe) {
                    localStorage.setItem('vertaAuth', JSON.stringify(authData));
                    localStorage.setItem('vertaRememberMe', 'true');
                }
                
                // 设置认证状态
                this.setAuthenticatedState(authData);
                
                // 显示成功消息
                showToast('Login successful! Welcome back!', 'success');
                
                // 关闭模态框
                closeAuthModal();
                
                return { success: true };
            } else {
                showToast(loginResult.message || 'Login failed', 'error');
                return { success: false, message: loginResult.message };
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
            return { success: false, message: 'Network error' };
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 处理注册
     */
    async handleRegister(userData) {
        try {
            this.setLoadingState(true);
            
            // 验证密码
            if (userData.password !== userData.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return { success: false, message: 'Passwords do not match' };
            }
            
            // 验证密码强度
            const passwordStrength = this.checkPasswordStrength(userData.password);
            if (passwordStrength.score < 3) {
                showToast('Password is too weak', 'error');
                return { success: false, message: 'Password is too weak' };
            }
            
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟注册
            const registerResult = this.mockRegister(userData);
            
            if (registerResult.success) {
                showToast('Account created successfully! Please verify your email.', 'success');
                
                // 自动登录
                const loginResult = await this.handleLogin(userData.email, userData.password, true);
                
                return { success: true };
            } else {
                showToast(registerResult.message || 'Registration failed', 'error');
                return { success: false, message: registerResult.message };
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Registration failed. Please try again.', 'error');
            return { success: false, message: 'Network error' };
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 模拟登录验证
     */
    mockLogin(email, password) {
        // 演示用户凭据
        const demoUsers = {
            'demo@verta.com': 'password123',
            'user@example.com': 'password',
            'test@verta.com': 'test123'
        };

        if (demoUsers[email] && demoUsers[email] === password) {
            return {
                success: true,
                user: {
                    id: Math.random().toString(36).substr(2, 9),
                    email: email,
                    firstName: 'Demo',
                    lastName: 'User',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    joinDate: new Date().toISOString(),
                    deviceId: 'VTA-' + Math.random().toString(36).substr(2, 8).toUpperCase()
                },
                token: 'mock_jwt_token_' + Math.random().toString(36)
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    }

    /**
     * 模拟注册
     */
    mockRegister(userData) {
        // 检查邮箱是否已存在（模拟）
        const existingEmails = ['taken@example.com', 'admin@verta.com'];
        
        if (existingEmails.includes(userData.email)) {
            return {
                success: false,
                message: 'Email already exists'
            };
        }

        return {
            success: true,
            user: {
                id: Math.random().toString(36).substr(2, 9),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
                joinDate: new Date().toISOString(),
                deviceId: userData.deviceId || null
            }
        };
    }

    /**
     * 处理登出
     */
    handleLogout() {
        this.currentUser = null;
        this.authToken = null;
        this.isLoggedIn = false;
        
        // 清除存储
        this.clearStoredAuth();
        
        // 更新UI
        this.updateAuthUI();
        
        showToast('Logged out successfully', 'success');
        
        console.log('👋 User logged out');
    }

    /**
     * 社交登录
     */
    async handleSocialLogin(provider) {
        try {
            showToast(`Connecting to ${provider}...`, 'success');
            
            // 模拟社交登录
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const socialUser = {
                id: Math.random().toString(36).substr(2, 9),
                email: `demo@${provider}.com`,
                firstName: 'Social',
                lastName: 'User',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
                provider: provider
            };

            const authData = {
                user: socialUser,
                token: `${provider}_token_` + Math.random().toString(36),
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            this.setAuthenticatedState(authData);
            localStorage.setItem('vertaAuth', JSON.stringify(authData));
            localStorage.setItem('vertaRememberMe', 'true');

            showToast(`Welcome! Logged in with ${provider}`, 'success');
            closeAuthModal();

        } catch (error) {
            console.error(`${provider} login error:`, error);
            showToast(`${provider} login failed`, 'error');
        }
    }

    /**
     * 检查密码强度
     */
    checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // 长度检查
        if (password.length >= 8) score++;
        else feedback.push('At least 8 characters');

        // 包含数字
        if (/\d/.test(password)) score++;
        else feedback.push('Include numbers');

        // 包含小写字母
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Include lowercase letters');

        // 包含大写字母
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Include uppercase letters');

        // 包含特殊字符
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Include special characters');

        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        return {
            score: score,
            strength: strengthLevels[Math.min(score, 4)],
            feedback: feedback
        };
    }

    /**
     * 更新认证UI
     */
    updateAuthUI() {
        const navLinks = document.querySelector('.nav-links');
        const loginBtn = navLinks?.querySelector('.login-btn');
        const registerBtn = navLinks?.querySelector('.register-btn');
        const userProfile = document.getElementById('userProfile');

        if (this.isLoggedIn && this.currentUser) {
            // 隐藏登录按钮，显示用户头像
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            // 显示用户头像
            if (userProfile) {
                userProfile.classList.remove('hidden');
                
                // 更新用户信息
                const profileName = document.getElementById('profileName');
                const profileEmail = document.getElementById('profileEmail');
                const profileAvatar = document.getElementById('profileAvatar');
                
                if (profileName) profileName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
                if (profileEmail) profileEmail.textContent = this.currentUser.email;
                if (profileAvatar) profileAvatar.src = this.currentUser.avatar;
                
                // 将用户头像克隆到导航栏
                const existingNavProfile = navLinks?.querySelector('.user-profile');
                if (!existingNavProfile) {
                    const profileClone = userProfile.cloneNode(true);
                    profileClone.classList.remove('hidden');
                    navLinks?.appendChild(profileClone);
                }
            }
            
        } else {
            // 显示登录按钮，隐藏用户头像
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            
            if (userProfile) userProfile.classList.add('hidden');
            
            // 从导航中移除用户头像
            const navUserProfile = navLinks?.querySelector('.user-profile');
            if (navUserProfile) navUserProfile.remove();
        }
    }

    /**
     * 设置加载状态
     */
    setLoadingState(loading) {
        const authButtons = document.querySelectorAll('.auth-button');
        authButtons.forEach(button => {
            if (loading) {
                button.disabled = true;
                button.textContent = 'Loading...';
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
                
                // 恢复按钮文本
                if (button.closest('#loginForm')) {
                    button.textContent = 'Sign In';
                } else if (button.closest('#registerForm')) {
                    button.textContent = 'Create Account';
                }
            }
        });
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 检查是否已登录
     */
    isAuthenticated() {
        return this.isLoggedIn;
    }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();

// 认证相关的全局函数
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // 清除表单
    document.querySelectorAll('.auth-form input').forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
}

function switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function switchToRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function checkPasswordStrength(password) {
    const strengthResult = authManager.checkPasswordStrength(password);
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (strengthFill && strengthText) {
        const colors = ['#ff4757', '#ff6b6b', '#ffa726', '#66bb6a', '#4caf50'];
        const widths = ['20%', '40%', '60%', '80%', '100%'];
        
        strengthFill.style.width = widths[strengthResult.score];
        strengthFill.style.background = colors[strengthResult.score];
        strengthText.textContent = strengthResult.strength;
        strengthText.style.color = colors[strengthResult.score];
    }
    
    return strengthResult;
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    await authManager.handleLogin(email, password, rememberMe);
}

async function handleRegister(event) {
    event.preventDefault();
    
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        deviceId: document.getElementById('deviceId').value,
        terms: document.getElementById('terms').checked,
        newsletter: document.getElementById('newsletter').checked
    };
    
    if (!userData.terms) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    await authManager.handleRegister(userData);
}

function handleLogout() {
    authManager.handleLogout();
    closeProfileDropdown();
}

function socialLogin(provider) {
    authManager.handleSocialLogin(provider);
}

function handleForgotPassword() {
    showToast('Password reset link sent to your email!', 'success');
    closeAuthModal();
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown?.classList.toggle('hidden');
}

function closeProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown?.classList.add('hidden');
}

function showProfile() {
    showToast('Profile page coming soon!', 'success');
    closeProfileDropdown();
}

function showSettings() {
    showToast('Settings page coming soon!', 'success');
    closeProfileDropdown();
}

function showNotifications() {
    showToast('Notifications page coming soon!', 'success');
    closeProfileDropdown();
}

function showToast(message, type = 'success', duration = 4000) {
    const toast = document.getElementById('notificationToast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastIcon || !toastMessage) return;
    
    // 设置消息和图标
    toastMessage.textContent = message;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toastIcon.textContent = icons[type] || icons.success;
    
    // 设置样式
    toast.className = `notification toast ${type}`;
    toast.classList.add('show');
    
    // 自动隐藏
    setTimeout(() => {
        closeToast();
    }, duration);
}

function closeToast() {
    const toast = document.getElementById('notificationToast');
    toast?.classList.remove('show');
}

// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
    
    const profileDropdown = document.getElementById('profileDropdown');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileDropdown && !profileDropdown.classList.contains('hidden') && 
        !profileDropdown.contains(event.target) && 
        !profileAvatar?.contains(event.target)) {
        closeProfileDropdown();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('authModal');
        if (modal?.classList.contains('show')) {
            closeAuthModal();
        }
    }
});

// 导出到全局作用域
window.authManager = authManager;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.socialLogin = socialLogin;
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;
window.showToast = showToast;

console.log('🔐 Authentication system loaded');