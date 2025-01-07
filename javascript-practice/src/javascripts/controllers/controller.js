import Invoice from '../model/model.js';
import InvoiceView from '../views/view.js';
class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.invoices = [];
    this.discountPercentage = 5;
    this.init();
  }

  init() {
    //click x button to close form edit and form create invoice
    document.querySelectorAll('.form__header-close').forEach((btn) => {
      btn.addEventListener('click', () => this.closeForm());
    });

    // Click to add invoice
    document.querySelector('.btn--primary').addEventListener('click', () => this.showCreateForm());
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());
    this.view.invoiceList.addEventListener('click', (e) => this.handleListClick(e));
    // Save changes in form edit
    document
      .querySelector('.form--edit .form__action-buttons--button-save')
      .addEventListener('click', () => this.saveChanges());
    this.setupProductListHandlers();

    // Add event listeners for discount input
    const discountInput = document.querySelectorAll('.discount-input');
    discountInput.forEach((input) => {
      input.addEventListener('input', (e) => {
        this.discountPercentage = parseFloat(e.target.value) || 0;
        this.updateAmounts(this.getActiveFormTbody());
      });
    });
  }

  getActiveFormTbody() {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    return activeForm?.querySelector('product-list__table tbody');
  }

  calculateTotals(rows) {
    let subtotal = 0;

    //Calculate subtotal from all products
    rows.forEach((row) => {
      const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
      const qty = parseInt(row.querySelector('.qty-input').value) || 0;
      const amount = rate * qty;
      subtotal += amount;
    });
    // Calculate discount amount
    const discountAmount = (subtotal * this.discountPercentage) / 100;

    // Calculate final total
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      total,
    };
  }

  setupProductListHandlers() {
    const addProductBtns = document.querySelectorAll('.product-list__action-button--button-add');
    addProductBtns.forEach((btn) => {
      // Remove existing event listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Add new event listener
      newBtn.addEventListener('click', () => {
        const activeForm = document.querySelector(
          '.form--create:not(.hidden), .form--edit:not(.hidden)',
        );
        if (activeForm) {
          this.addProductRow(activeForm);
        }
      });
    });

    const forms = document.querySelectorAll('.form--create, .form--edit');
    forms.forEach((form) => {
      const tbody = form.querySelector('.product-list__table tbody');

      // Handle delete buttons
      tbody.addEventListener('click', (e) => {
        if (e.target.closest('.product-list__action-button--button-delete')) {
          const row = e.target.closest('tr');
          if (tbody.children.length > 1) {
            // Keep at least one row
            row.remove();
          } else {
            // Clear inputs if it's the last row
            row.querySelectorAll('input').forEach((input) => (input.value = ''));
          }
          this.updateAmounts(tbody);
        }
      });

      // Handle input changes
      tbody.addEventListener('input', (e) => {
        if (e.target.matches('.rate-input, .qty-input')) {
          this.updateAmounts(tbody);
        }
      });
    });
  }

  updateAmounts(tbody) {
    if (!tbody) return;

    // Update amount for each row
    const rows = tbody.querySelectorAll('.product-list__table-row');
    rows.forEach((row) => {
      const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
      const qty = parseInt(row.querySelector('.qty-input').value) || 0;
      const amount = rate * qty;
      row.querySelector('td:nth-child(4)').textContent = `$${amount.toFixed(2)}`;
    });
    //Calculate total
    const { subtotal, discountAmount, total } = this.calculateTotals(rows);

    //Update preview section totals
    const previewSection = document.querySelector('.preview-summary');
    if (previewSection) {
      //Update subtotal
      const subtotalElement = previewSection.querySelector(
        '.preview-summary__row:nth-child(1) .preview-summary__value',
      );
      if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
      }
      // Update discount
      const discountElement = previewSection.querySelector(
        '.preview-summary__row:nth-child(2) .preview-summary__value',
      );
      if (discountElement) {
        discountElement.textContent = `$${discountAmount.toFixed(2)}`;
      }

      // Update total
      const totalElement = previewSection.querySelector(
        '.preview-summary__total .preview-summary__value',
      );
      if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
      }
    }

    // Update preview if needed
    this.updatePreview();
  }

  closeForm() {
    document.querySelector('.form--create').classList.add('hidden');
    document.querySelector('.form--edit').classList.add('hidden');
    document.querySelector('.content').style.display = 'none';
    document.querySelector('.main').classList.remove('hidden');
    this.resetForm();
  }

  showCreateForm() {
    document.querySelector('.main').classList.add('hidden');
    document.querySelector('.content').style.display = 'grid';
    document.querySelector('.form--create').classList.remove('hidden');
    document.querySelector('.form--edit').classList.add('hidden');
    this.resetForm();
  }

  showEditForm() {
    document.querySelector('.main').classList.add('hidden');
    document.querySelector('.content').style.display = 'grid';
    document.querySelector('.form--create').classList.add('hidden');
    document.querySelector('.form--edit').classList.remove('hidden');
  }

  resetForm() {
    const inputs = document.querySelectorAll('.form__group-input');
    inputs.forEach((input) => (input.value = ''));

    // Get the active form and clear its product table
    const activeForm = document.querySelector(
      '.form--create:not(.hidden), .form--edit:not(.hidden)',
    );
    if (activeForm) {
      const tbody = activeForm.querySelector('.product-list__table .product-list__table-body');
      tbody.innerHTML = this.addProductRow(activeForm);
    }
  }
  resetFormStates() {
    // Hide all forms first
    document.querySelector('.form--create').classList.add('hidden');
    document.querySelector('.form--edit').classList.add('hidden');
    document.querySelector('.content').style.display = 'none';
    document.querySelector('.main').classList.remove('hidden');
  }

  addProductRow() {
    const newRow = `
      <tr class="product-list__table-row">
        <td class="product-list__cell"><input type="text" class="product-input"/></td>
        <td class="product-list__cell"><input type="number" class="rate-input"/></td>
        <td class="product-list__cell"><input type="number" class="qty-input"/></td>
        <td class="product-list__cell">$0.00</td>
        <td class="product-list__cell">
          <button class="btn product-list__action-buttons product-list__action-button--button-delete">
            <img
              class="delete-icon"
              src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg"
              alt="delete icon"
            />
          </button>
        </td>
      </tr>
    `;
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    const tbody = activeForm.querySelector('.product-list__table .product-list__table-body');
    tbody.insertAdjacentHTML('beforeend', newRow);
    this.updateAmounts(tbody);

    return newRow; // Keep the return for resetForm method
  }

  collectFormData() {
    const products = [];
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');

    if (!activeForm) return null;

    const rows = document.querySelectorAll(
      '.product-list__table .product-list__table-body .product-list__table-row',
    );

    rows.forEach((row) => {
      const productInput = row.querySelector('.product-input');
      const rateInput = row.querySelector('.rate-input');
      const qtyInput = row.querySelector('.qty-input');

      if (productInput && rateInput && qtyInput) {
        const name = productInput.value.trim();
        const rate = parseFloat(rateInput.value) || 0;
        const quantity = parseInt(qtyInput.value) || 0;

        if (name || rate || quantity) {
          // Only add if any field has a value
          products.push({ name, rate, quantity, amount: rate * quantity });
        }
      }
    });

    // Calculate totals for all products
    const { subtotal, discountAmount, total } = this.calculateTotals(rows);

    return {
      id: activeForm.querySelector('input[placeholder="#876370"]')?.value || `INV-${Date.now()}`,
      name: activeForm.querySelector('input[placeholder="Alison G."]')?.value || '',
      email: activeForm.querySelector('input[type="email"]')?.value || '',
      date: activeForm.querySelector('input[type="date"]')?.value || '',
      address: activeForm.querySelector('input[placeholder="Street"]')?.value || '',
      status: 'Pending',
      products,
    };
  }

  addInvoice() {
    const data = this.collectFormData();
    if (!data || !this.validateInvoice(data)) return;

    const invoice = new Invoice(
      data.id,
      data.name,
      data.email,
      data.date,
      data.address,
      data.status,
      data.products,
      data.subtotal,
      data.discountPercentage,
      data.discountAmount,
      data.total,
    );
    this.invoices.push(invoice);
    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(invoice);

    this.resetFormStates();
  }

  validateInvoice(data) {
    if (!data.name || !data.email || !data.date || data.products.length === 0) {
      alert('Please fill in all required fields and add at least one product');
      return false;
    }
    return true;
  }

  handleListClick(e) {
    const clickedElement = e.target;
    const row = e.target.closest('.table__row');
    if (!row) return;

    const idCell = row.querySelector('[data-label="Invoice Id"]');
    if (!idCell) return;
    const id = idCell.textContent;
    if (e.target.closest('.btn--delete')) {
      this.deleteInvoice(id);
    } else if (e.target.closest('.btn--edit')) {
      this.editInvoice(id);
    }
  }

  deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
      this.view.renderInvoiceList(this.invoices);
    }
  }
  editInvoice(id) {
    const invoice = this.invoices.find((invoice) => invoice.id === id);
    if (!invoice) return;

    this.showEditForm();
    const editForm = document.querySelector('.form--edit');
    // Fill in basic information
    editForm.querySelector('input[placeholder="#876370"]').value = invoice.id;
    editForm.querySelector('input[placeholder="Alison G."]').value = invoice.name;
    editForm.querySelector('input[type="email"]').value = invoice.email;
    editForm.querySelector('input[type="date"]').value = invoice.date;
    editForm.querySelector('input[placeholder="Street"]').value = invoice.address;

    //Set discount percentage
    this.discountPercentage = invoice.discountPercentage || 5;
    const discountInput = editForm.querySelector('.discount-input');
    if (discountInput) {
      discountInput.value = this.discountPercentage;
    }

    // Fill in products
    const tbody = editForm.querySelector(
      '.form--edit .product-list__table .product-list__table-body',
    );
    tbody.innerHTML = invoice.products
      .map(
        (product) => `
      <tr class="product-list__table-row">
        <td class="product-list__cell"><input type="text" class="product-input" value="${product.name}"></td>
        <td class="product-list__cell"><input type="number" class="rate-input" value="${product.rate}"></td>
        <td class="product-list__cell"><input type="number" class="qty-input" value="${product.quantity}"></td>
        <td class="product-list__cell">$${product.rate * product.quantity.toFixed(2)}</td>
        <td class="product-list__cell">
          <button class="btn product-list__action-buttons product-list__action-button--button-delete">
            <img src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg" alt="delete icon" class="delete-icon">
          </button>
        </td>
      </tr>
    `,
      )
      .join('');

    // Update totals
    this.updateAmounts(tbody);
  }

  saveChanges() {
    const data = this.collectFormData();
    if (!data || !this.validateInvoice(data)) return;

    // Find the invoice index
    const index = this.invoices.findIndex((inv) => inv.id === data.id);
    if (index === -1) return;

    // Update the invoice
    this.invoices[index] = new Invoice(
      data.id,
      data.name,
      data.email,
      data.date,
      data.address,
      data.status,
      data.products,
    );

    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(this.invoices[index]);

    // Reset visibility states
    document.querySelector('.content').style.display = 'none';
    document.querySelector('.main').classList.remove('hidden');
    document.querySelector('.form--edit').classList.add('hidden');
  }

  updatePreview() {
    const data = this.collectFormData();
    if (!data) return;

    try {
      const tempInvoice = new Invoice(
        data.id,
        data.name,
        data.email,
        data.date,
        data.address,
        data.status,
        data.products,
      );
      this.view.renderInvoicePreview(tempInvoice);
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }
}
export default InvoiceController;
