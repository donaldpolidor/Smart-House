import { getParam } from './utils.mjs';
import ProductData from './ProductData.mjs';
import ProductDetails from './ProductDetails.mjs';

document.addEventListener('DOMContentLoaded', function() {
  const productId = getParam("product");
  console.log("Product ID from URL:", productId);
  
  if (productId) {
    const dataSource = new ProductData();
    const productPage = new ProductDetails(productId, dataSource);
    productPage.init();
  } else {
    console.error("No product ID found in URL");
    const productDetailSection = document.querySelector(".product-detail");
    if (productDetailSection) {
      productDetailSection.innerHTML = `
        <div class="error">
          <h2>Error</h2>
          <p>Product not specified</p>
          <a href="/index.html">Back to home page</a>
        </div>
      `;
    }
  }
});