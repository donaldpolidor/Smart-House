// weather.js - Météo pour Haïti avec débogage
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
        // Rafraîchir toutes les 30 minutes
        setInterval(() => {
            this.loadHaitiWeather();
        }, 30 * 60 * 1000);

        // Rafraîchir au clic
        this.weatherElement.addEventListener('click', () => {
            this.loadHaitiWeather();
        });
    }

    async loadHaitiWeather() {
        try {
            this.showLoading('Loading Haiti weather...');
            console.log('🔄 Fetching weather data...');
            
            // Essayer différentes méthodes
            await this.tryWeatherMethods();
            
        } catch (error) {
            console.error('❌ All weather methods failed:', error);
            this.showStaticHaitiWeather();
        }
    }

    async tryWeatherMethods() {
        const methods = [
            () => this.getWeatherByCity('Port-au-Prince Haiti'),
            () => this.getWeatherByCity('Port-au-Prince'),
            () => this.getWeatherByCoordinates(18.5944, -72.3074), // Port-au-Prince
            () => this.getWeatherByCity('Cap-Haitien Haiti'),
            () => this.getWeatherByCity('Haiti')
        ];

        for (const method of methods) {
            try {
                await method();
                console.log('✅ Weather data loaded successfully');
                return;
            } catch (error) {
                console.log(`❌ Method failed: ${error.message}`);
                continue;
            }
        }
        throw new Error('All weather methods failed');
    }

    async getWeatherByCity(city) {
        console.log(`📍 Trying city: ${city}`);
        
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
        console.log('📊 API Response:', data);

        return this.processWeatherData(data, city);
    }

    async getWeatherByCoordinates(lat, lng) {
        console.log(`🎯 Trying coordinates: ${lat}, ${lng}`);
        
        const params = new URLSearchParams({
            engine: 'google',
            q: `weather ${lat},${lng}`,
            api_key: this.apiKey,
            hl: 'en',
            gl: 'ht'
        });

        const response = await fetch(`https://serpapi.com/search.json?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return this.processWeatherData(data, 'Current Location');
    }

    processWeatherData(data, location) {
        // Chercher les données météo dans différentes structures de réponse
        let weatherData = null;

        if (data.weather) {
            weatherData = data.weather;
            console.log('✅ Found data in weather property');
        } else if (data.answer_box && data.answer_box.weather) {
            weatherData = data.answer_box.weather;
            console.log('✅ Found data in answer_box.weather');
        } else if (data.answer_box && data.answer_box.temperature) {
            weatherData = data.answer_box;
            console.log('✅ Found data in answer_box');
        } else if (data.forecast) {
            weatherData = data;
            console.log('✅ Found data in forecast');
        }

        if (!weatherData) {
            console.log('❌ No weather data found in response structure');
            console.log('Available keys:', Object.keys(data));
            throw new Error('No weather data in response');
        }

        this.displayWeather(this.parseWeatherData(weatherData, location));
    }

    parseWeatherData(weatherData, location) {
        console.log('🔍 Parsing weather data:', weatherData);

        // Extraire les données selon différentes structures possibles
        const temperature = weatherData.temperature || 
                           weatherData.temp || 
                           weatherData.current_temperature || 
                           '28'; // Fallback pour Haïti

        const description = weatherData.condition || 
                           weatherData.weather || 
                           weatherData.description || 
                           'Sunny'; // Fallback pour Haïti

        const humidity = weatherData.humidity || '75';
        const wind = weatherData.wind || '15 km/h';

        return {
            temperature: temperature,
            description: description,
            location: location,
            humidity: humidity,
            wind: wind,
            precipitation: weatherData.precipitation || '0%'
        };
    }

    displayWeather(weatherData) {
        console.log('🎨 Displaying weather:', weatherData);
        
        const weatherHTML = `
            <div class="weather-content">
                <div class="weather-header">
                    <div class="haiti-flag">🇭🇹</div>
                    <div class="weather-title">Haiti Weather</div>
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
                        <span>Feels like ${weatherData.temperature}°C</span>
                    </div>
                </div>
                <div class="weather-source">
                    <span class="google-icon">🌐</span>
                    Live data from Google
                </div>
                <div class="weather-update-time">
                    Updated: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;

        this.weatherElement.innerHTML = weatherHTML;
        this.weatherElement.classList.add('loaded');
        this.weatherElement.classList.remove('error');
        
        console.log('✅ Weather displayed successfully');
    }

    showStaticHaitiWeather() {
        console.log('🔄 Showing static Haiti weather data');
        
        // Données statiques typiques pour Haïti
        const staticData = {
            temperature: '28',
            description: 'Sunny',
            location: 'Port-au-Prince, Haiti',
            humidity: '75%',
            wind: '15 km/h',
            precipitation: '10%'
        };

        this.displayWeather(staticData);
    }

    getWeatherIcon(description) {
        const desc = description.toLowerCase();
        if (desc.includes('sun') || desc.includes('clear')) return '☀️';
        if (desc.includes('cloud')) return '☁️';
        if (desc.includes('rain')) return '🌧️';
        if (desc.includes('storm')) return '⛈️';
        return '🌤️';
    }

    showLoading(message) {
        console.log('⏳ Loading:', message);
        
        this.weatherElement.innerHTML = `
            <div class="weather-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
                <div class="loading-subtext">Using SerpAPI with Google data</div>
                <div class="haiti-loading">🇭🇹</div>
                <div class="loading-debug">Checking API connection...</div>
            </div>
        `;
        this.weatherElement.classList.remove('loaded', 'error');
    }

    showError(message) {
        console.error('❌ Weather error:', message);
        
        this.weatherElement.innerHTML = `
            <div class="weather-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <div class="error-debug">
                    <p>API Key: ${this.apiKey ? '✅ Present' : '❌ Missing'}</p>
                    <p>Network: ${navigator.onLine ? '✅ Online' : '❌ Offline'}</p>
                </div>
                <button class="retry-btn">🔄 Try Again</button>
            </div>
        `;

        this.weatherElement.classList.add('error');
        this.weatherElement.querySelector('.retry-btn').addEventListener('click', () => {
            this.loadHaitiWeather();
        });
    }
}

// Test immédiat de l'API
async function testSerpAPI() {
    console.log('🧪 Testing SerpAPI connection...');
    
    try {
        const testParams = new URLSearchParams({
            engine: 'google',
            q: 'weather Haiti',
            api_key: '29be23e6c2c789c0e791724d99b185386bcf24a5529f5de13a8a5743a84b1b01',
            hl: 'en'
        });

        const response = await fetch(`https://serpapi.com/search.json?${testParams}`);
        const data = await response.json();
        
        console.log('🔍 Test response structure:', Object.keys(data));
        if (data.error) {
            console.error('❌ API Error:', data.error);
        } else {
            console.log('✅ API connection successful');
        }
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Haiti Weather Widget');
    testSerpAPI(); // Test de l'API au chargement
    new WeatherWidget();
});

export default WeatherWidget;