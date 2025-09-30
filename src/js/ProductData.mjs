export default class ProductData {
  constructor() {
    this.products = [];
    this.categories = [
      { id: "kitchen", name: "Kitchen", icon: "👨‍🍳" },
      { id: "bathroom", name: "Bathroom", icon: "🚿" },
      { id: "cleaning", name: "Cleaning", icon: "🧹" },
      { id: "decoration", name: "Decoration", icon: "🖼️" }
    ];
  }

  async loadData(category) {
    try {
      let jsonFile;
      
      // Sélectionner le fichier JSON en fonction de la catégorie
      switch(category) {
        case 'kitchen':
          jsonFile = '/public/json/kitchen.json';
          break;
        case 'bathroom':
          jsonFile = '/public/json/bathroom.json';
          break;
        case 'cleaning':
          jsonFile = '/public/json/cleaning.json';
          break;
        case 'decoration':
          jsonFile = '/public/json/decoration.json';
          break;
        default:
          jsonFile = '/public/json/kitchen.json';
      }
      
      const response = await fetch(jsonFile);
      if (!response.ok) {
        throw new Error(`Failed to load ${category} data`);
      }
      const data = await response.json();
      this.products = data.products || [];
      
    } catch (error) {
      console.error(`Error loading ${category} product data:`, error);
      this.products = [];
    }
  }

  async getData(category = 'kitchen') {
    // Recharger les données à chaque fois pour la catégorie demandée
    await this.loadData(category);
    return this.products;
  }

  async getProductById(id) {
    // Pour trouver un produit par ID, on doit chercher dans tous les fichiers
    // On commence par la cuisine (catégorie par défaut)
    if (this.products.length === 0) {
      await this.loadData('kitchen');
    }
    
    let product = this.products.find(product => product.id === id);
    
    // Si pas trouvé, chercher dans les autres catégories
    if (!product) {
      const categories = ['bathroom', 'cleaning', 'decoration'];
      for (const category of categories) {
        await this.loadData(category);
        product = this.products.find(product => product.id === id);
        if (product) break;
      }
    }
    
    return product;
  }

  async getCategories() {
    return this.categories;
  }
}