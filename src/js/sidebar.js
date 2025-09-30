import { getLocalStorage, setLocalStorage } from './utils.mjs';

class SidebarManager {
  constructor() {
    this.ads = document.querySelectorAll('.ad-image');
    this.currentAd = 0;
    this.weatherContent = document.querySelector('.weather-content');
    this.weatherLoading = document.querySelector('.weather-loading');
    this.noteInput = document.querySelector('.note-input');
    this.saveNoteBtn = document.querySelector('.save-note-btn');
    this.savedNotes = document.querySelector('.saved-notes');
    this.sidebar = document.querySelector('.sidebar');
    
    this.init();
  }

  init() {
    this.startAdsSlider();
    this.loadWeather();
    this.loadSavedNotes();
    this.setupNoteEvents();
    this.setupScrollEffects();
  }

  // Effets de scroll pour la sidebar
  setupScrollEffects() {
    if (!this.sidebar) return;

    let scrollTimeout;
    
    this.sidebar.addEventListener('scroll', () => {
      // Ajouter la classe scrolling pendant le défilement
      this.sidebar.classList.add('scrolling');
      
      // Gestion des effets de bord
      const scrollTop = this.sidebar.scrollTop;
      const scrollHeight = this.sidebar.scrollHeight;
      const clientHeight = this.sidebar.clientHeight;
      
      if (scrollTop === 0) {
        this.sidebar.classList.remove('scrolling-top');
      } else {
        this.sidebar.classList.add('scrolling-top');
      }
      
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        this.sidebar.classList.add('scrolling-bottom');
      } else {
        this.sidebar.classList.remove('scrolling-bottom');
      }
      
      // Retirer la classe scrolling après arrêt du défilement
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.sidebar.classList.remove('scrolling');
      }, 500);
    });

    // Smooth scroll pour les liens internes (si ajoutés plus tard)
    this.setupInternalLinks();
  }

  setupInternalLinks() {
    // Pour les liens internes dans la sidebar (ex: ancres)
    this.sidebar.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const sidebarRect = this.sidebar.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const scrollTop = targetRect.top - sidebarRect.top + this.sidebar.scrollTop - 20;
          
          this.sidebar.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  // Publicités - défilement automatique
  startAdsSlider() {
    if (this.ads.length === 0) return;

    const rotateAd = () => {
      // Cacher l'annonce actuelle
      this.ads[this.currentAd].classList.remove('active');
      this.ads[this.currentAd].classList.add('leaving');

      // Passer à l'annonce suivante
      this.currentAd = (this.currentAd + 1) % this.ads.length;

      // Afficher la nouvelle annonce
      setTimeout(() => {
        this.ads.forEach(ad => {
          ad.classList.remove('leaving');
          ad.classList.remove('active');
        });
        this.ads[this.currentAd].classList.add('active');
      }, 800);
    };

    // Démarrer le défilement et répéter toutes les 10 secondes
    setInterval(rotateAd, 10000);
  }

  // Météo - Simulation (remplacez par Google Maps API)
  async loadWeather() {
    try {
      // Simulation de données météo
      setTimeout(() => {
        this.weatherLoading.style.display = 'none';
        this.weatherContent.style.display = 'block';
        
        // Données simulées - remplacez par l'API Google Maps
        const weatherData = {
          temp: '22°C',
          description: 'Partiellement nuageux',
          location: 'Paris, FR',
          icon: '🌤️'
        };

        this.updateWeatherDisplay(weatherData);
      }, 2000);

    } catch (error) {
      console.error('Error loading weather:', error);
      this.weatherLoading.textContent = 'Météo non disponible';
    }
  }

  updateWeatherDisplay(data) {
    document.querySelector('.weather-icon').textContent = data.icon;
    document.querySelector('.weather-temp').textContent = data.temp;
    document.querySelector('.weather-desc').textContent = data.description;
    document.querySelector('.weather-location').textContent = data.location;
  }

  // Notes d'achat
  setupNoteEvents() {
    this.saveNoteBtn.addEventListener('click', () => {
      this.saveNote();
    });

    this.noteInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.saveNote();
      }
    });
  }

  saveNote() {
    const noteText = this.noteInput.value.trim();
    if (!noteText) return;

    const notes = getLocalStorage('shopping-notes') || [];
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toLocaleString('fr-FR')
    };

    notes.unshift(newNote); // Ajouter au début
    setLocalStorage('shopping-notes', notes);
    
    this.noteInput.value = '';
    this.loadSavedNotes();
    
    // Feedback visuel
    this.showSaveFeedback();
  }

  showSaveFeedback() {
    const originalText = this.saveNoteBtn.textContent;
    this.saveNoteBtn.textContent = '✓ Saved!';
    this.saveNoteBtn.style.background = '#45a049';
    
    setTimeout(() => {
      this.saveNoteBtn.textContent = originalText;
      this.saveNoteBtn.style.background = '';
    }, 2000);
  }

  loadSavedNotes() {
    const notes = getLocalStorage('shopping-notes') || [];
    this.savedNotes.innerHTML = '';

    if (notes.length === 0) {
      this.savedNotes.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 1rem;">No saved notes</p>';
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
      this.savedNotes.appendChild(noteElement);
    });

    // Ajouter les événements de suppression
    this.savedNotes.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteId = parseInt(e.target.getAttribute('data-id'));
        this.deleteNote(noteId);
      });
    });
  }

  deleteNote(noteId) {
    let notes = getLocalStorage('shopping-notes') || [];
    notes = notes.filter(note => note.id !== noteId);
    setLocalStorage('shopping-notes', notes);
    this.loadSavedNotes();
  }

  // Méthode utilitaire pour scroller vers une section
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && this.sidebar) {
      const sectionRect = section.getBoundingClientRect();
      const sidebarRect = this.sidebar.getBoundingClientRect();
      const scrollTop = sectionRect.top - sidebarRect.top + this.sidebar.scrollTop - 20;
      
      this.sidebar.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }
}

// Initialiser la sidebar quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new SidebarManager();
});