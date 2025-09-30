import { getLocalStorage, alertMessage } from './utils.mjs';
import CheckoutService from './CheckoutService.mjs';

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.checkoutService = new CheckoutService();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
    this.displayCartItems();
    this.calculateOrderTotal();
  }

  calculateItemSummary() {
    this.itemTotal = 0;
    this.itemTotal = this.list.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
    this.updateDisplay('item-total', this.itemTotal);
  }

  calculateOrderTotal() {
    this.tax = Math.round((this.itemTotal * 0.06) * 100) / 100;
    const itemCount = this.list.reduce((count, item) => {
      return count + (item.quantity || 1);
    }, 0);
    this.shipping = 10 + (Math.max(0, itemCount - 1) * 2);
    this.orderTotal = Math.round((this.itemTotal + this.tax + this.shipping) * 100) / 100;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElement = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotalElement = document.querySelector(`${this.outputSelector} #order-total`);

    if (taxElement) taxElement.textContent = `$${this.tax.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${this.shipping.toFixed(2)}`;
    if (orderTotalElement) orderTotalElement.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  updateDisplay(elementId, value) {
    const element = document.querySelector(`${this.outputSelector} #${elementId}`);
    if (element) {
      element.textContent = `$${value.toFixed(2)}`;
    }
  }

  displayCartItems() {
    const cartItemsElement = document.querySelector(`${this.outputSelector} #cart-items`);
    if (!cartItemsElement) return;

    if (this.list.length === 0) {
      cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
      return;
    }

    cartItemsElement.innerHTML = this.list.map(item => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const total = price * quantity;
      
      return `
        <div class="cart-item">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">Quantity: ${quantity}</span>
          <span class="item-price">$${total.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  packageItems() {
    return this.list.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      quantity: item.quantity || 1
    }));
  }

  formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};

    formData.forEach(function(value, key) {
      convertedJSON[key] = value;
    });

    return convertedJSON;
  }

  async checkout(formElement) {
    try {
      this.calculateOrderTotal();
      
      const formData = this.formDataToJSON(formElement);
      
      const order = {
        orderDate: new Date().toISOString(),
        ...formData,
        items: this.packageItems(),
        orderTotal: this.orderTotal.toFixed(2),
        shipping: this.shipping,
        tax: this.tax.toFixed(2)
      };

      const response = await this.checkoutService.checkout(order);
      
      const orderInfo = {
        orderId: response.orderId,
        total: this.orderTotal.toFixed(2),
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('lastOrder', JSON.stringify(orderInfo));
      localStorage.removeItem('so-cart');
      
      return response;
      
    } catch (error) {
      if (error.name === 'servicesError') {
        const errorMessage = error.message?.message || 'Server validation failed';
        alertMessage(`Checkout Error: ${errorMessage}`, true);
        throw new Error(`Server Error: ${errorMessage}`);
      }
      throw error;
    }
  }
}