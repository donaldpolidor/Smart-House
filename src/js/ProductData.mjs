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
      // Chemins absolus pour Netlify
      const paths = [
        `/json/${category}.json`,
        `./json/${category}.json`
      ];
      
      let response;
      for (const path of paths) {
        try {
          console.log(`Trying to load: ${path}`);
          response = await fetch(path);
          if (response.ok) {
            console.log(`✓ Successfully loaded: ${path}`);
            break;
          }
        } catch (e) {
          console.log(`✗ Failed to load: ${path}`);
          continue;
        }
      }
      
      if (!response || !response.ok) {
        console.warn(`File ${category}.json not found`);
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
    if (this.allProducts[category] && this.allProducts[category].length > 0) {
      return this.allProducts[category];
    }
    
    const products = await this.loadCategoryData(category);
    
    if (products.length === 0 && category !== 'kitchen') {
      console.log(`Category ${category} empty, using kitchen as fallback`);
      return await this.loadCategoryData('kitchen');
    }
    
    return products;
  }

  async getProductById(id) {
    for (const category of this.categories) {
      if (!this.allProducts[category.id]) {
        await this.loadCategoryData(category.id);
      }
      
      const product = this.allProducts[category.id].find(product => product.id === id);
      if (product) {
        return product;
      }
    }
    
    console.warn(`Product with ID ${id} not found`);
    return null;
  }

  async getCategories() {
    return this.categories;
  }

  clearCache() {
    this.allProducts = {};
  }
}