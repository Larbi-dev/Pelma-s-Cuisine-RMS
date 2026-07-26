function switchTab(tab) {
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const nameGroup = document.getElementById('nameGroup');
    const submitBtn = document.getElementById('submitBtn');
    const authForm = document.getElementById('authForm');
    const formMessage = document.getElementById('formMessage');

    if (formMessage) formMessage.textContent = '';
    if (authForm) authForm.reset();

    if (tab === 'signin') {
        if (signInTab) signInTab.classList.add('active');
        if (signUpTab) signUpTab.classList.remove('active');
        if (nameGroup) nameGroup.style.display = 'none';
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) fullNameInput.removeAttribute('required');
        if (submitBtn) submitBtn.textContent = 'Sign In to Dashboard';
    } else {
        if (signUpTab) signUpTab.classList.add('active');
        if (signInTab) signInTab.classList.remove('active');
        if (nameGroup) nameGroup.style.display = 'block';
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) fullNameInput.setAttribute('required', 'true');
        if (submitBtn) submitBtn.textContent = 'Create Account';
    }
}

function handleAuth(event) {
    event.preventDefault();

    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const roleEl = document.getElementById('role');
    const fullNameInput = document.getElementById('fullName');
    const formMessage = document.getElementById('formMessage');
    const signUpTab = document.getElementById('signUpTab');
    
    const isSignUp = signUpTab ? signUpTab.classList.contains('active') : false;

    const username = usernameEl ? usernameEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value.trim() : '';
    const role = roleEl ? roleEl.value : 'customer';

    if (!username || !password) {
        if (formMessage) {
            formMessage.style.color = '#ff4747';
            formMessage.textContent = 'Please fill in all required fields.';
        }
        return;
    }

    const mockUser = {
        username: username,
        name: isSignUp && fullNameInput ? fullNameInput.value.trim() : username,
        role: role,
        token: 'pelma_secure_token_' + Math.random().toString(36).substring(2)
    };

    localStorage.setItem('pelmaUser', JSON.stringify(mockUser));

    if (formMessage) {
        formMessage.style.color = '#2ecc71';
        formMessage.textContent = isSignUp ? 'Account created successfully! Redirecting...' : 'Sign in successful! Redirecting...';
    }

    setTimeout(() => {
        if (role === 'customer') {
            window.location.href = 'index.html';
        } else if (role === 'staff') {
            window.location.href = 'staff/dashboard.html';
        } else if (role === 'admin') {
            window.location.href = 'admin/index.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
}