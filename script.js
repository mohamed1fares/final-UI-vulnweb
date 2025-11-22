
const app = {
    state: {
        page: 'welcome',
        companyUrl: '',
        user: {
            name: '',
            email: '',
            isAuthenticated: false
        },
        isLoginMode: false,
        vulnerabilities: []
    },

    // DOM Elements cache
    elements: {
        get welcomePage() { return document.getElementById('welcome-page') },
        get authPage() { return document.getElementById('auth-page') },
        get loadingView() { return document.getElementById('loading-view') },
        get resultsPage() { return document.getElementById('results-page') },
        get navUserArea() { return document.getElementById('nav-user-area') },
        get navCompanyUrl() { return document.getElementById('nav-company-url') },
        
        // Auth specific
        get authTitle() { return document.getElementById('auth-title') },
        get authSubtitle() { return document.getElementById('auth-subtitle') },
        get nameField() { return document.getElementById('name-field') },
        get authSubmitBtnText() { return document.getElementById('btn-text') },
        get authSubmitBtnLoader() { return document.getElementById('btn-loader') },
        get authToggleText() { return document.getElementById('auth-toggle-text') },
        get authToggleBtn() { return document.getElementById('auth-toggle-btn') },
        
        // Results specific
        get grid() { return document.getElementById('vulnerabilities-grid') },
        get statTotal() { return document.getElementById('stat-total') },
        get statCritical() { return document.getElementById('stat-critical') },
        get statHigh() { return document.getElementById('stat-high') },
        get loadingUrl() { return document.getElementById('loading-url') },
        get resultsUrl() { return document.getElementById('results-url') },
        get searchInput() { return document.getElementById('search-input') }
    },

    init() {
        // Welcome Form Listener
        document.getElementById('welcome-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const urlInput = document.getElementById('company-url-input').value;
            if (!urlInput.includes('.') || urlInput.length < 4) {
                const errorEl = document.getElementById('welcome-error');
                errorEl.textContent = 'Please enter a valid domain (e.g., example.com)';
                errorEl.classList.remove('hidden');
                return;
            }
            this.state.companyUrl = urlInput;
            this.navigateTo('auth');
        });

        // Auth Form Listener
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        // Search Listener
        this.elements.searchInput.addEventListener('input', (e) => {
            this.renderVulnerabilities(e.target.value);
        });

        // Initial render
        this.navigateTo('welcome');
    },

    navigateTo(pageId) {
        // Hide all
        this.elements.welcomePage.classList.add('hidden');
        this.elements.authPage.classList.add('hidden');
        this.elements.loadingView.classList.add('hidden');
        this.elements.resultsPage.classList.add('hidden');
        this.elements.navUserArea.classList.add('hidden');

        // Show specific
        switch(pageId) {
            case 'welcome':
                this.elements.welcomePage.classList.remove('hidden');
                break;
            case 'auth':
                this.elements.authPage.classList.remove('hidden');
                this.updateAuthUI();
                break;
            case 'loading':
                this.elements.loadingView.classList.remove('hidden');
                this.elements.loadingUrl.textContent = this.state.companyUrl;
                break;
            case 'results':
                this.elements.resultsPage.classList.remove('hidden');
                this.elements.navUserArea.classList.remove('hidden');
                this.elements.navCompanyUrl.textContent = this.state.companyUrl;
                this.elements.resultsUrl.textContent = this.state.companyUrl;
                break;
        }
        this.state.page = pageId;
    },

    toggleAuthMode() {
        this.state.isLoginMode = !this.state.isLoginMode;
        this.updateAuthUI();
    },

    updateAuthUI() {
        const isLogin = this.state.isLoginMode;
        this.elements.authTitle.textContent = isLogin ? 'Welcome Back' : 'Create Account';
        this.elements.authSubtitle.textContent = isLogin ? 'Access your security dashboard' : `Start scanning ${this.state.companyUrl}`;
        this.elements.nameField.style.display = isLogin ? 'none' : 'block';
        document.getElementById('auth-name').required = !isLogin;
        this.elements.authSubmitBtnText.textContent = isLogin ? 'Sign In' : 'Create Account';
        this.elements.authToggleText.textContent = isLogin ? "Don't have an account? " : "Already have an account? ";
        this.elements.authToggleBtn.textContent = isLogin ? 'Sign up' : 'Log in';
    },

    handleAuthSubmit() {
        const btnText = this.elements.authSubmitBtnText;
        const btnLoader = this.elements.authSubmitBtnLoader;
        const btn = document.getElementById('auth-submit-btn');

        // Loading state
        btn.disabled = true;
        btnText.classList.add('opacity-0');
        btnLoader.classList.remove('hidden');

        setTimeout(() => {
            // Reset button
            btn.disabled = false;
            btnText.classList.remove('opacity-0');
            btnLoader.classList.add('hidden');

            // Logic
            const name = document.getElementById('auth-name').value;
            const email = document.getElementById('auth-email').value;
            
            this.state.user = {
                name: this.state.isLoginMode ? email.split('@')[0] : name,
                email: email,
                isAuthenticated: true
            };

            this.startScan();
        }, 1500);
    },

    startScan() {
        this.navigateTo('loading');
        
        // Simulate scanning delay
        setTimeout(() => {
            this.state.vulnerabilities = this.generateMockData();
            this.renderVulnerabilities();
            this.updateStats();
            this.navigateTo('results');
        }, 2500);
    },

    logout() {
        this.state.user = { name: '', email: '', isAuthenticated: false };
        this.state.companyUrl = '';
        this.state.vulnerabilities = [];
        document.getElementById('company-url-input').value = '';
        this.navigateTo('welcome');
    },

    downloadReport(btnElement) {
        const originalText = btnElement.querySelector('span').textContent;
        const icon = btnElement.querySelector('svg');
        
        // Loading State
        btnElement.querySelector('span').textContent = "Generating PDF...";
        btnElement.classList.add('opacity-75', 'cursor-wait');
        
        setTimeout(() => {
            btnElement.querySelector('span').textContent = "Report Downloaded!";
            icon.classList.add('text-green-400');
            
            setTimeout(() => {
                btnElement.querySelector('span').textContent = originalText;
                btnElement.classList.remove('opacity-75', 'cursor-wait');
                icon.classList.remove('text-green-400');
            }, 2000);
        }, 1500);
    },

    generateMockData() {
        return [
            {
                id: '1',
                name: 'SQL Injection (Blind)',
                description: 'The application vulnerability allows an attacker to interfere with the queries that an application makes to its database.',
                severity: 'Critical',
                cveId: 'CVE-2024-3891',
                discoveredAt: new Date().toLocaleDateString()
            },
            {
                id: '2',
                name: 'Cross-Site Scripting (Reflected)',
                description: 'Reflected XSS arises when an application receives data in an HTTP request and includes that data within the immediate response.',
                severity: 'High',
                cveId: 'CVE-2024-1022',
                discoveredAt: new Date().toLocaleDateString()
            },
            {
                id: '3',
                name: 'Insecure Direct Object Reference',
                description: 'The application does not properly validate that the user is authorized to access the specific resource ID requested.',
                severity: 'High',
                cveId: 'CVE-2023-9912',
                discoveredAt: new Date(Date.now() - 86400000).toLocaleDateString()
            },
            {
                id: '4',
                name: 'Missing Security Headers',
                description: 'The web server response is missing crucial security headers like Content-Security-Policy or X-Frame-Options.',
                severity: 'Low',
                cveId: 'N/A',
                discoveredAt: new Date(Date.now() - 172800000).toLocaleDateString()
            },
            {
                id: '5',
                name: 'Outdated SSL/TLS Protocol',
                description: 'The server supports TLS 1.0 or 1.1 which are considered deprecated and insecure protocols.',
                severity: 'Medium',
                cveId: 'N/A',
                discoveredAt: new Date().toLocaleDateString()
            },
            {
                id: '6',
                name: 'Admin Panel Exposure',
                description: 'The administrative interface is accessible from the public internet without IP restriction.',
                severity: 'Critical',
                cveId: 'CVE-2024-5501',
                discoveredAt: new Date().toLocaleDateString()
            }
        ];
    },

    renderVulnerabilities(searchTerm = '') {
        const grid = this.elements.grid;
        grid.innerHTML = '';

        const filtered = this.state.vulnerabilities.filter(v => 
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            v.severity.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.forEach(vuln => {
            // Determine colors
            let sevColorClass, sevIcon;
            switch (vuln.severity) {
                case 'Critical': 
                    sevColorClass = 'text-cyber-accent border-cyber-accent/30 bg-cyber-accent/5';
                    sevIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>`;
                    break;
                case 'High': 
                    sevColorClass = 'text-orange-500 border-orange-500/30 bg-orange-500/5';
                    sevIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>`;
                    break;
                case 'Medium': 
                    sevColorClass = 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
                    sevIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>`;
                    break;
                default: 
                    sevColorClass = 'text-blue-400 border-blue-400/30 bg-blue-400/5';
                    sevIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>`;
            }

            const card = document.createElement('div');
            card.className = "group relative bg-cyber-card border border-slate-800 rounded-xl p-6 transition-all duration-300 hover:border-slate-600 hover:bg-slate-900 hover:-translate-y-1";
            card.innerHTML = `
                <div class="absolute -inset-px bg-gradient-to-b from-slate-700 to-transparent opacity-0 group-hover:opacity-20 rounded-xl pointer-events-none transition-opacity"></div>
                
                <div class="flex justify-between items-start mb-4">
                    <div class="px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-2 ${sevColorClass}">
                        ${sevIcon}
                        ${vuln.severity.toUpperCase()}
                    </div>
                    <span class="text-xs text-slate-500 font-mono">${vuln.cveId}</span>
                </div>

                <h3 class="text-xl font-semibold text-slate-100 mb-2 group-hover:text-cyber-primary transition-colors">
                    ${vuln.name}
                </h3>
                
                <p class="text-slate-400 text-sm mb-6 line-clamp-2">
                    ${vuln.description}
                </p>

                <div class="flex justify-between items-center mt-auto">
                    <span class="text-xs text-slate-600">
                       Discovered: ${vuln.discoveredAt}
                    </span>
                    <button class="flex items-center text-sm font-medium text-cyber-primary opacity-80 group-hover:opacity-100 transition-all hover:gap-2">
                        View Details 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    updateStats() {
        this.elements.statTotal.textContent = this.state.vulnerabilities.length;
        this.elements.statCritical.textContent = this.state.vulnerabilities.filter(v => v.severity === 'Critical').length;
        this.elements.statHigh.textContent = this.state.vulnerabilities.filter(v => v.severity === 'High').length;
    }
};

// Make app global
window.app = app;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
