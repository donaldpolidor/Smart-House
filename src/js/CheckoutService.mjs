export default class CheckoutService {
  async checkout(order) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: 'ORD-' + Date.now(),
          status: 'success',
          message: 'Order processed successfully'
        });
      }, 1000);
    });
  }
}