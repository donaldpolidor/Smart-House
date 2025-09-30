export default class ProductData {
  constructor() {
    this.allProducts = {};
    this.categories = [
      { id: "kitchen", name: "Kitchen", icon: "👨‍🍳" },
      { id: "bathroom", name: "Bathroom", icon: "🚿" },
      { id: "cleaning", name: "Cleaning", icon: "🧹" },
      { id: "decoration", name: "Decoration", icon: "🖼️" }
    ];
  }

  async loadCategoryData(category) {
    try {
      // Chemins absolus pour Netlify - IMPORTANT
      const paths = [
        `/json/${category}.json`,
        `./json/${category}.json`,
        `/public/json/${category}.json`,
        `../json/${category}.json`
      ];
      
      let response;
      for (const path of paths) {
        try {
          response = await fetch(path);
          if (response.ok) break;
        } catch (e) {
          continue;
        }
      }
      
      if (!response || !response.ok) {
        console.warn(`Fichier ${category}.json non trouvé`);
        this.allProducts[category] = [];
        return [];
      }
      
      const data = await response.json();
      this.allProducts[category] = data.products || [];
      return this.allProducts[category];
      
    } catch (error) {
      console.error(`Error loading ${category} data:`, error);
      this.allProducts[category] = [];
      return [];
    }
  }

  async getData(category = 'kitchen') {
    // Si on a déjà les données, les retourner
    if (this.allProducts[category] && this.allProducts[category].length > 0) {
      return this.allProducts[category];
    }
    
    // Sinon charger les données
    const products = await this.loadCategoryData(category);
    
    // Si la catégorie est vide, charger kitchen comme fallback
    if (products.length === 0 && category !== 'kitchen') {
      console.log(`Catégorie ${category} vide, utilisation de kitchen`);
      return await this.loadCategoryData('kitchen');
    }
    
    return products;
  }

  async getProductById(id) {
    // Chercher dans toutes les catégories
    for (const category of this.categories) {
      if (!this.allProducts[category.id]) {
        await this.loadCategoryData(category.id);
      }
      
      const product = this.allProducts[category.id].find(product => product.id === id);
      if (product) {
        return product;
      }
    }
    
    console.warn(`Produit avec ID ${id} non trouvé`);
    return null;
  }

  async getCategories() {
    return this.categories;
  }

  // Méthode pour vider le cache
  clearCache() {
    this.allProducts = {};
  }
}