// weather.js - Weather for Haiti ONLY
class WeatherWidget {
    constructor() {
        this.apiKey = '29be23e6c2c789c0e791724d99b185386bcf24a5529f5de13a8a5743a84b1b01';
        this.weatherElement = document.querySelector('.weather-widget');
        this.init();
    }

    init() {
        console.log('🌤️ Initializing Haiti Weather Widget...');
        this.loadHaitiWeather();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Refresh every 30 minutes
        setInterval(() => {
            this.loadHaitiWeather();
        }, 30 * 60 * 1000);

        // Refresh on click
        if (this.weatherElement) {
            this.weatherElement.addEventListener('click', () => {
                this.loadHaitiWeather();
            });
        }
    }

    async loadHaitiWeather() {
        try {
            this.showLoading('Loading Haiti weather...');
            console.log('🔄 Fetching Haiti weather data...');
            
            // Use only Port-au-Prince, Haiti
            await this.getWeatherByCity('Port-au-Prince Haiti');
            
        } catch (error) {
            console.error('❌ Haiti weather failed:', error);
            this.showStaticHaitiWeather();
        }
    }

    async getWeatherByCity(city) {
        console.log(`📍 Loading weather for: ${city}`);
        
        const params = new URLSearchParams({
            engine: 'google',
            q: `weather ${city}`,
            api_key: this.apiKey,
            hl: 'en',
            gl: 'ht'
        });

        const response = await fetch(`https://serpapi.com/search.json?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Haiti API Response:', data);

        return this.processWeatherData(data, 'Haiti');
    }

    processWeatherData(data, location) {
        let weatherData = null;

        // Look for weather data in the response
        if (data.weather) {
            weatherData = data.weather;
        } else if (data.answer_box && data.answer_box.weather) {
            weatherData = data.answer_box.weather;
        } else if (data.answer_box && data.answer_box.temperature) {
            weatherData = data.answer_box;
        }

        if (!weatherData) {
            console.log('❌ No weather data found for Haiti');
            throw new Error('No weather data for Haiti');
        }

        const parsedData = this.parseWeatherData(weatherData, location);
        this.displayWeather(parsedData);
        
        // Send data to mobile sidebar
        this.sendWeatherToMobileSidebar(parsedData);
    }

    parseWeatherData(weatherData, location) {
        console.log('🔍 Parsing Haiti weather data:', weatherData);

        // Typical data for Haiti
        const haitiWeather = {
            temperature: weatherData.temperature || '30',
            description: weatherData.condition || 'Sunny',
            location: 'Haiti',
            humidity: weatherData.humidity || '75',
            wind: weatherData.wind || '15 km/h',
            precipitation: weatherData.precipitation || '10%',
            feelsLike: weatherData.feels_like || '32',
            windSpeed: 15,
            pressure: '1013',
            visibility: '10',
            condition: 'clear'
        };

        return haitiWeather;
    }

    displayWeather(weatherData) {
        console.log('🎨 Displaying Haiti weather:', weatherData);
        
        const weatherHTML = `
            <div class="weather-content">
                <div class="weather-header">
                    <div class="haiti-flag">🇭🇹</div>
                    <div class="weather-title">HAITI WEATHER</div>
                </div>
                <div class="weather-icon">${this.getWeatherIcon(weatherData.description)}</div>
                <div class="weather-temp">${weatherData.temperature}°C</div>
                <div class="weather-desc">${weatherData.description}</div>
                <div class="weather-location">
                    <span class="location-icon">📍</span>
                    ${weatherData.location}
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="detail-icon">💧</span>
                        <span>${weatherData.humidity}% humidity</span>
                    </div>
                    <div class="weather-detail">
                        <span class="detail-icon">💨</span>
                        <span>${weatherData.wind}</span>
                    </div>
                    <div class="weather-detail">
                        <span class="detail-icon">🌡️</span>
                        <span>Feels like ${weatherData.feelsLike}°C</span>
                    </div>
                </div>
                <div class="weather-source">
                    <span class="google-icon">🌐</span>
                    Haiti weather data
                </div>
                <div class="weather-update-time">
                    Updated: ${new Date().toLocaleTimeString('en-US')}
                </div>
            </div>
        `;

        if (this.weatherElement) {
            this.weatherElement.innerHTML = weatherHTML;
            this.weatherElement.classList.add('loaded');
            this.weatherElement.classList.remove('error');
        }
        
        console.log('✅ Haiti weather displayed successfully');
    }

    // Send data to mobile sidebar
    sendWeatherToMobileSidebar(weatherData) {
        console.log('📱 Sending Haiti weather to mobile sidebar');
        
        const weatherEvent = new CustomEvent('weatherUpdated', {
            detail: {
                temperature: parseInt(weatherData.temperature) || 30,
                condition: weatherData.condition,
                description: weatherData.description,
                location: weatherData.location,
                humidity: parseInt(weatherData.humidity) || 75,
                windSpeed: weatherData.windSpeed || 15,
                pressure: weatherData.pressure || '1013',
                feelsLike: parseInt(weatherData.feelsLike) || 32,
                visibility: parseInt(weatherData.visibility) || 10,
                precipitation: weatherData.precipitation || '10%'
            }
        });
        
        document.dispatchEvent(weatherEvent);
    }

    showStaticHaitiWeather() {
        console.log('🔄 Showing static Haiti weather data');
        
        // Static typical data for Haiti
        const staticData = {
            temperature: '30',
            description: 'Sunny',
            location: 'Haiti',
            humidity: '75%',
            wind: '15 km/h',
            precipitation: '10%',
            feelsLike: '32',
            windSpeed: 15,
            pressure: '1013',
            visibility: '10',
            condition: 'clear'
        };

        this.displayWeather(staticData);
        this.sendWeatherToMobileSidebar(staticData);
    }

    getWeatherIcon(description) {
        const desc = description.toLowerCase();
        if (desc.includes('sun') || desc.includes('clear') || desc.includes('sunny')) return '☀️';
        if (desc.includes('cloud')) return '☁️';
        if (desc.includes('rain')) return '🌧️';
        if (desc.includes('storm')) return '⛈️';
        return '🌤️';
    }

    showLoading(message) {
        console.log('⏳ Loading:', message);
        
        const loadingHTML = `
            <div class="weather-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
                <div class="loading-subtext">Current weather in Haiti</div>
                <div class="haiti-loading">🇭🇹</div>
            </div>
        `;

        if (this.weatherElement) {
            this.weatherElement.innerHTML = loadingHTML;
            this.weatherElement.classList.remove('loaded', 'error');
        }
    }

    showError(message) {
        console.error('❌ Haiti weather error:', message);
        
        const errorHTML = `
            <div class="weather-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <div class="error-suggestion">
                    <p>Using standard weather data for Haiti</p>
                    <ul>
                        <li>🌡️ Temperature: 28-32°C</li>
                        <li>☀️ Sunny to partly cloudy</li>
                        <li>💨 Wind: 10-20 km/h</li>
                    </ul>
                </div>
                <button class="retry-btn">🔄 Try Again</button>
            </div>
        `;

        if (this.weatherElement) {
            this.weatherElement.innerHTML = errorHTML;
            this.weatherElement.classList.add('error');
            
            const retryBtn = this.weatherElement.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadHaitiWeather();
                });
            }
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Haiti Weather Widget');
    new WeatherWidget();
});

export default WeatherWidget;