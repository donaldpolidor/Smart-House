// mobile-sidebar.js
import { getLocalStorage, setLocalStorage } from './utils.mjs';

class MobileSidebarManager {
  constructor() {
    this.tabButtons = document.querySelectorAll('.mobile-tab-btn');
    this.mobileSidebar = document.getElementById('mobileSidebar');
    this.sidebarTitle = document.getElementById('mobileSidebarTitle');
    this.sidebarContent = document.getElementById('mobileSidebarContent');
    this.closeBtn = document.getElementById('closeSidebarBtn');
    this.backdrop = document.getElementById('sidebarBackdrop');
    
    this.init();
  }

  init() {
    this.setupTabEvents();
    this.setupCloseEvents();
    this.loadInitialContent();
  }

  setupTabEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.openSidebar(tab);
      });
    });
  }

  setupCloseEvents() {
    this.closeBtn.addEventListener('click', () => this.closeSidebar());
    this.backdrop.addEventListener('click', () => this.closeSidebar());
    
    // Close with the Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileSidebar.classList.contains('active')) {
        this.closeSidebar();
      }
    });
  }

  loadInitialContent() {
    // Preload article content
    this.loadArticlesContent();
  }

  openSidebar(tab) {
    // Update active buttons
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Load content according to tab
    switch(tab) {
      case 'articles':
        this.loadArticlesContent();
        this.sidebarTitle.textContent = 'Articles & Specials';
        break;
      case 'weather':
        this.loadWeatherContent();
        this.sidebarTitle.textContent = 'Weather';
        break;
      case 'notes':
        this.loadNotesContent();
        this.sidebarTitle.textContent = 'Shopping Notes';
        break;
    }

    // Open the sidebar
    this.mobileSidebar.classList.add('active');
    this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    this.mobileSidebar.classList.remove('active');
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset active buttons
    this.tabButtons.forEach(btn => btn.classList.remove('active'));
  }

  loadArticlesContent() {
    const content = `
      <div class="sidebar-section">
        <h3>Article coming soon</h3>
        <div class="ads-container">
          <div class="ads-slider">
            <img src="/images/pub_1.jpg" alt="Advertisement 1" class="ad-image active">
            <img src="/images/pub_2.jpg" alt="Advertisement 2" class="ad-image">
            <img src="/images/pub_3.jpg" alt="Advertisement 3" class="ad-image">
          </div>
        </div>
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
    
    this.sidebarContent.innerHTML = content;
    this.startMobileAdsSlider();
  }

  loadWeatherContent() {
    const content = `
      <div class="sidebar-section">
        <h3>Weather</h3>
        <div class="weather-widget">
          <div class="weather-loading">Loading weather...</div>
          <div class="weather-content" style="display: none;">
            <div class="weather-icon">🌤️</div>
            <div class="weather-temp">--°C</div>
            <div class="weather-desc">--</div>
            <div class="weather-location">--</div>
          </div>
        </div>
      </div>
    `;
    
    this.sidebarContent.innerHTML = content;
    this.loadMobileWeather();
  }

  loadNotesContent() {
    const content = `
      <div class="sidebar-section">
        <h3>Purchase notes</h3>
        <div class="sticky-notes">
          <textarea class="note-input" placeholder="Write your shopping list here..."></textarea>
          <button class="save-note-btn">Save</button>
          <div class="saved-notes"></div>
        </div>
      </div>
    `;
    
    this.sidebarContent.innerHTML = content;
    this.setupMobileNotes();
  }

  startMobileAdsSlider() {
    const ads = this.sidebarContent.querySelectorAll('.ad-image');
    if (ads.length === 0) return;

    let currentAd = 0;
    
    const rotateAd = () => {
      ads[currentAd].classList.remove('active');
      ads[currentAd].classList.add('leaving');

      currentAd = (currentAd + 1) % ads.length;

      setTimeout(() => {
        ads.forEach(ad => {
          ad.classList.remove('leaving');
          ad.classList.remove('active');
        });
        ads[currentAd].classList.add('active');
      }, 800);
    };

    setInterval(rotateAd, 10000);
  }

  async loadMobileWeather() {
    try {
      const weatherLoading = this.sidebarContent.querySelector('.weather-loading');
      const weatherContent = this.sidebarContent.querySelector('.weather-content');

      setTimeout(() => {
        weatherLoading.style.display = 'none';
        weatherContent.style.display = 'block';
        
        const weatherData = {
          temp: '22°C',
          description: 'Partly cloudy',
          location: 'Port-au-Prince, HT',
          icon: '🌤️'
        };

        this.updateMobileWeatherDisplay(weatherData);
      }, 2000);

    } catch (error) {
      console.error('Error loading weather:', error);
      const weatherLoading = this.sidebarContent.querySelector('.weather-loading');
      weatherLoading.textContent = 'Weather unavailable';
    }
  }

  updateMobileWeatherDisplay(data) {
    const weatherContent = this.sidebarContent.querySelector('.weather-content');
    weatherContent.querySelector('.weather-icon').textContent = data.icon;
    weatherContent.querySelector('.weather-temp').textContent = data.temp;
    weatherContent.querySelector('.weather-desc').textContent = data.description;
    weatherContent.querySelector('.weather-location').textContent = data.location;
  }

  setupMobileNotes() {
    const noteInput = this.sidebarContent.querySelector('.note-input');
    const saveNoteBtn = this.sidebarContent.querySelector('.save-note-btn');
    const savedNotes = this.sidebarContent.querySelector('.saved-notes');

    const saveNote = () => {
      const noteText = noteInput.value.trim();
      if (!noteText) return;

      const notes = getLocalStorage('shopping-notes') || [];
      const newNote = {
        id: Date.now(),
        text: noteText,
        date: new Date().toLocaleString('fr-FR')
      };

      notes.unshift(newNote);
      setLocalStorage('shopping-notes', notes);
      
      noteInput.value = '';
      loadSavedNotes();
      
      // Visual feedback
      showSaveFeedback();
    };

    const showSaveFeedback = () => {
      const originalText = saveNoteBtn.textContent;
      saveNoteBtn.textContent = '✓ Saved!';
      saveNoteBtn.style.background = '#45a049';
      
      setTimeout(() => {
        saveNoteBtn.textContent = originalText;
        saveNoteBtn.style.background = '';
      }, 2000);
    };

    const loadSavedNotes = () => {
      const notes = getLocalStorage('shopping-notes') || [];
      savedNotes.innerHTML = '';

      if (notes.length === 0) {
        savedNotes.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 1rem;">No saved notes</p>';
        return;
      }

      notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
          <div>${note.text}</div>
          <div class="note-date">${note.date}</div>
          <button class="delete-note" data-id="${note.id}" title="Delete note">×</button>
        `;
        savedNotes.appendChild(noteElement);
      });

      // Add deletion events
      savedNotes.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const noteId = parseInt(e.target.getAttribute('data-id'));
          deleteNote(noteId);
        });
      });
    };

    const deleteNote = (noteId) => {
      let notes = getLocalStorage('shopping-notes') || [];
      notes = notes.filter(note => note.id !== noteId);
      setLocalStorage('shopping-notes', notes);
      loadSavedNotes();
    };

    saveNoteBtn.addEventListener('click', saveNote);
    noteInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        saveNote();
      }
    });

    loadSavedNotes();
  }
}

// Initialize the mobile sidebar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileSidebarManager();
});