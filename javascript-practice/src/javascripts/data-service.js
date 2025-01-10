class DataService {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }

  // Invoice Methods
  async getAllInvoices() {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async createInvoice(invoice) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Failed to create invoice');
      return await response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(id, invoice) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Failed to update invoice');
      return await response.json();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(id) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete invoice');
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  async deleteMultipleInvoices(ids) {
    try {
      const promises = ids.map((id) => this.deleteInvoice(id));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error deleting multiple invoices:', error);
      throw error;
    }
  }

  // Product Methods
  async getProductsByInvoiceId(invoiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/products?invoiceId=${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async addProduct(product) {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to add product');
      return await response.json();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export default DataService;
