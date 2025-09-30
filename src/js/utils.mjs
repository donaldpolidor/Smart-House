export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

export function updateCartCount() {
  const cart = getLocalStorage('so-cart') || [];
  const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  
  const cartCounter = document.querySelector('.cart-count');
  if (cartCounter) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

export function addProductToCart(product) {
  let cart = getLocalStorage('so-cart') || [];
  
  const existingItemIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
  } else {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    cart.push(productToAdd);
  }
  
  const success = setLocalStorage('so-cart', cart);
  
  if (success) {
    const event = new CustomEvent('cartUpdated');
    document.dispatchEvent(event);
  }
  
  return success;
}

export function loadHeaderFooter() {
  loadHeader();
  loadFooter();
  updateCartCount();
}

async function loadHeader() {
  try {
    const response = await fetch('/public/partials/header.html');
    const headerHtml = await response.text();
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
      headerElement.innerHTML = headerHtml;
      // Mettre à jour le compteur du panier dans le header
      updateCartCount();
    }
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch('/public/partials/footer.html');
    const footerHtml = await response.text();
    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
      footerElement.innerHTML = footerHtml;
    }
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

export function alertMessage(message, scroll = true) {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.innerHTML = `<p>${message}</p><span>×</span>`;
  
  alert.addEventListener('click', function(e) {
    if(e.target.tagName == 'SPAN') {
      this.remove();
    }
  });
  
  const main = document.querySelector('main');
  main.prepend(alert);
  
  if(scroll) window.scrollTo(0,0);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(templateFn, parentElement, list, position = 'afterbegin', clear = true) {
  if (clear) parentElement.innerHTML = '';
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(''));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}