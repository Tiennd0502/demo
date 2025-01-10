class DataHandler {
  constructor() {
    this.rootUrl = 'http://localhost:3000';
  }
  /**
   * Invoice methods
   */
  async getInvoiceList() {
    try {
      const response = await fetch(`${this.rootUrl}/invoices`);
      if (!response.ok) throw new Error('Fail to fetch invoices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const response = await fetch(`${this.rootUrl}/invoices/${id}`);
      if (!response.ok) throw new Error('Fail to fetch invoice');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice', error);
      throw error;
    }
  }

  async createInvoice(invoice) {
    try {
      const response = await fetch(`${this.rootUrl}/invoices`, {
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Fail to create invoice');
      return await response.json();
    } catch (error) {
      console.error('Error creating invoice', error);
      throw error;
    }
  }

  async updateInvoice(id, invoice) {
    try {
      const response = await fetch(`${this.rootUrl}/invoices/${id}`, {
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Fail to update invoice');
      return await response.json();
    } catch (error) {
      console.error('Error updating invoice', error);
      throw error;
    }
  }

  async deleteInvoice(id, invoice) {
    try {
      const response = await fetch(`${this.rootUrl}/invoices/${id}`, {
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) throw new Error('Fail to delete invoice');
      return true;
    } catch (error) {
      console.error('Error deleting invoice', error);
      throw error;
    }
  }

  async deleteMultipleInvoices(ids) {
    try {
      const promises = ids.map((id) => this.deleteInvoice(id));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error deleting invoices', error);
      throw error;
    }
  }

  /**
   * Product methods
   */
  async getProductsByInvoiceId(invoiceId) {
    try {
      const response = await fetch(`${this.rootUrl}/products?invoiceId=${invoiceId}`);
      if (!response.ok) throw new Error('Fail to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products', error);
      throw error;
    }
  }

  async addProduct(product) {
    try {
      const response = await fetch(`${this.rootUrl}/products`, {
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Fail to add product');
      return await response.json();
    } catch (error) {
      console.error('Error adding product', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      const response = await fetch(`${this.rootUrl}/products/${id}`, {
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('fail to update product');
      return await response.json();
    } catch (error) {
      console.error('Error updating product', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.rootUrl}/products/${id}`, {
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('fail to delete product');
      return await response.json();
    } catch (error) {
      console.error('Error deleting product', error);
      throw error;
    }
  }
}

export default DataHandler;
