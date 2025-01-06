class Invoice {
  constructor(id, name, email, date, status, products) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.date = date;
    this.status = status;
    this.products = products || [];
  }

  getTotalAmount() {
    return this.products.reduce((total, product) => total + product.rate * product.quantity, 0);
  }
}
export default Invoice;
