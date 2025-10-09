// mobile-sidebar.js - Gestion des onglets de la barre latérale mobile
class MobileSidebar {
    constructor() {
        this.tabButtons = document.querySelectorAll('.mobile-tab-btn');
        this.sidebar = document.getElementById('mobileSidebar');
        this.sidebarContent = document.getElementById('mobileSidebarContent');
        this.sidebarTitle = document.getElementById('mobileSidebarTitle');
        this.closeBtn = document.getElementById('closeSidebarBtn');
        this.backdrop = document.getElementById('sidebarBackdrop');
        this.mainContent = document.querySelector('.main-content');
        this.currentTab = null;
        
        this.init();
    }

    init() {
        // Tab button events
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.openTab(tab);
            });
        });

        // Closing
        this.closeBtn.addEventListener('click', () => this.closeSidebar());
        this.backdrop.addEventListener('click', () => this.closeSidebar());

        // Close with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });

        // Listen to weather updates
        document.addEventListener('weatherUpdated', (e) => {
            if (this.currentTab === 'weather') {
                this.updateMobileWeather(e.detail);
            }
        });
    }

    openTab(tab) {
        this.currentTab = tab;
        
        // Updates the title
        const titles = {
            'articles': 'Articles & Special Offers',
            'weather': 'Current weather', 
            'notes': 'Purchase notes'
        };
        this.sidebarTitle.textContent = titles[tab] || 'Sidebar';
        
        // Injects the content
        this.injectContent(tab);
        
        // Opens the sidebar
        this.sidebar.classList.add('active');
        this.backdrop.classList.add('active');
        this.mainContent.classList.add('sidebar-open');
        
        // Button animation
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Load the weather if necessary
        if (tab === 'weather') {
            this.loadWeatherData();
        }
    }

    injectContent(tab) {
        let content = '';
        
        switch(tab) {
            case 'articles':
                content = this.getArticlesContent();
                break;
            case 'weather':
                content = this.getWeatherContent();
                break;
            case 'notes':
                content = this.getNotesContent();
                break;
        }
        
        this.sidebarContent.innerHTML = content;
        
        // Resets features if necessary
        if (tab === 'notes') {
            this.initNotesFunctionality();
        } else if (tab === 'articles') {
            this.initArticlesSlider();
        }
    }

    getArticlesContent() {
        return `
            <div class="sidebar-section">
                <h3>Article coming soon</h3>
                <div class="ads-container">
                    <div class="ads-slider">
                        <img src="/images/pub_1.jpg" alt="Advertisement 1" class="ad-image active">
                        <img src="/images/pub_2.jpg" alt="Advertisement 2" class="ad-image">
                        <img src="/images/pub_3.jpg" alt="Advertisement 3" class="ad-image">
                    </div>
                </div>
                <p style="text-align: center; margin-top: 1rem; color: #666; font-size: 0.9rem;">
                    Discover our new products coming soon!
                </p>
            </div>

            <div class="sidebar-section">
                <h3>Special Offers</h3>
                <div class="special-offer">
                    <h3>🔥 Flash Sale!</h3>
                    <p>Up to 50% OFF on selected items. Limited time offer!</p>
                </div>
                <div class="special-offer">
                    <h3>🎁 Free Shipping</h3>
                    <p>Free delivery on orders over $50. Shop now!</p>
                </div>
                <div class="special-offer">
                    <h3>⭐ New Arrivals</h3>
                    <p>Check out our latest smart home products!</p>
                </div>
            </div>
        `;
    }

    getWeatherContent() {
        return `
            <div class="sidebar-section">
                <h3>Weather</h3>
                <div class="weather-widget">
                    <div class="weather-loading">Loading weather...</div>
                    <div class="weather-content" style="display: none;">
                        <div class="weather-header">
                            <span class="haiti-flag">🇭🇹</span>
                            <span class="weather-title">HAÏTI</span>
                        </div>
                        <div class="weather-icon">🌤️</div>
                        <div class="weather-temp">--°C</div>
                        <div class="weather-desc">--</div>
                        <div class="weather-location">Port-au-Prince</div>
                    </div>
                </div>
            </div>
        `;
    }

    getNotesContent() {
        return `
            <div class="sidebar-section">
                <h3>Purchase notes</h3>
                <div class="sticky-notes">
                    <textarea class="note-input" placeholder="Write your shopping list here..."></textarea>
                    <button class="save-note-btn">Save</button>
                    <div class="saved-notes"></div>
                </div>
            </div>
        `;
    }

    initArticlesSlider() {
        const adsSlider = this.sidebarContent.querySelector('.ads-slider');
        if (!adsSlider) return;

        const images = adsSlider.querySelectorAll('.ad-image');
        let currentIndex = 0;

        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 4000);
    }

    loadWeatherData() {
        // Attempt to retrieve existing weather data
        const existingWeather = this.getExistingWeatherData();
        if (existingWeather) {
            this.updateMobileWeather(existingWeather);
        } else {
            // Simulates loading if no data is available
            setTimeout(() => {
                this.updateMobileWeather({
                    temperature: 28,
                    condition: 'clear',
                    description: 'Sunny',
                    location: 'Port-au-Prince'
                });
            }, 1000);
        }
    }

    getExistingWeatherData() {
        // Attempt to retrieve data from the main weather widget
        const mainWeatherWidget = document.querySelector('.weather-widget');
        if (mainWeatherWidget) {
            const tempElement = mainWeatherWidget.querySelector('.weather-temp');
            const descElement = mainWeatherWidget.querySelector('.weather-desc');
            
            if (tempElement && descElement && tempElement.textContent !== '--°C') {
                return {
                    temperature: parseInt(tempElement.textContent),
                    condition: 'clear',
                    description: descElement.textContent,
                    location: 'Port-au-Prince'
                };
            }
        }
        return null;
    }

    updateMobileWeather(weatherData) {
        const weatherContent = this.sidebarContent.querySelector('.weather-content');
        const weatherLoading = this.sidebarContent.querySelector('.weather-loading');
        
        if (weatherData && weatherContent) {
            if (weatherLoading) weatherLoading.style.display = 'none';
            weatherContent.style.display = 'block';
            
            const icon = weatherContent.querySelector('.weather-icon');
            const temp = weatherContent.querySelector('.weather-temp');
            const desc = weatherContent.querySelector('.weather-desc');
            const location = weatherContent.querySelector('.weather-location');
            
            if (icon) icon.textContent = this.getWeatherIcon(weatherData.condition);
            if (temp) temp.textContent = `${Math.round(weatherData.temperature)}°C`;
            if (desc) desc.textContent = weatherData.description;
            if (location && weatherData.location) location.textContent = weatherData.location;
        }
    }

    getWeatherIcon(condition) {
        const icons = {
            'clear': '☀️', 'clouds': '☁️', 'rain': '🌧️', 
            'drizzle': '🌦️', 'thunderstorm': '⛈️', 'snow': '❄️',
            'mist': '🌫️', 'smoke': '💨', 'haze': '🌫️',
            'sunny': '☀️', 'partly-cloudy': '⛅'
        };
        return icons[condition] || '🌤️';
    }

    initNotesFunctionality() {
        const saveBtn = this.sidebarContent.querySelector('.save-note-btn');
        const noteInput = this.sidebarContent.querySelector('.note-input');
        const savedNotes = this.sidebarContent.querySelector('.saved-notes');
        
        if (saveBtn && noteInput) {
            saveBtn.addEventListener('click', () => {
                this.saveNote(noteInput, savedNotes);
            });
            
            // Input to save
            noteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.saveNote(noteInput, savedNotes);
                }
            });
        }
        
        // Load existing notes
        this.loadNotes(savedNotes);
    }

    saveNote(input, container) {
        const text = input.value.trim();
        if (text) {
            const notes = JSON.parse(localStorage.getItem('shopping-notes') || '[]');
            notes.push({
                text: text,
                date: new Date().toLocaleDateString('fr-FR')
            });
            localStorage.setItem('shopping-notes', JSON.stringify(notes));
            input.value = '';
            this.loadNotes(container);
        }
    }

    loadNotes(container) {
        if (!container) return;
        
        const notes = JSON.parse(localStorage.getItem('shopping-notes') || '[]');
        container.innerHTML = notes.map((note, index) => `
            <div class="note-item">
                ${note.text}
                <div class="note-date">${note.date}</div>
                <button class="delete-note" data-index="${index}">×</button>
            </div>
        `).join('');
        
        // Adds deletion events
        container.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteNote(index, container);
            });
        });
    }

    deleteNote(index, container) {
        const notes = JSON.parse(localStorage.getItem('shopping-notes') || '[]');
        notes.splice(index, 1);
        localStorage.setItem('shopping-notes', JSON.stringify(notes));
        this.loadNotes(container);
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.backdrop.classList.remove('active');
        this.mainContent.classList.remove('sidebar-open');
        
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.currentTab = null;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new MobileSidebar();
});