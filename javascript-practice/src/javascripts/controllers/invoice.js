import Invoice from '../model/model.js';
import Templates from '../templates/templates.js';
import InvoiceView from '../views/view.js';
import ValidationUtils from '../helpers/validation-utils.js';
import NotificationUtils from '../helpers/notification-utils.js';
import DataHandler from '../data-handler.js';
import * as formHandlers from './form-handlers.js';
import * as productHandlers from './product-handlers.js';

/**
 * This class handles the main logic for managing invoices, including rendering forms,
 * setting up event listeners, and handling invoice actions such as adding and saving invoices.
 *
 * Dependencies:
 * - Invoice: The model representing an invoice.
 * - Templates: Contains HTML templates for rendering forms and invoice lists.
 * - InvoiceView: Handles the rendering of invoices in the view.
 * - formHandlers: Contains functions for handling form-related events.
 * - productHandlers: Contains functions for handling product list-related events.
 */
class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.validator = new ValidationUtils();
    this.notification = new NotificationUtils();
    this.dataHandler = new DataHandler();
    this.invoices = [];

    this.discountPercentage = 5;
    this.init();
  }

  /**
   * Initializes the controller by rendering forms and setting up event listeners.
   */
  init() {
    this.loadInvoices();
    this.renderForms();
    this.setupSortHandlers();
    this.setupSearchInvoice();
    this.setupEventListeners();
    this.setupFavoriteHandler();
  }

  async loadInvoices() {
    try {
      this.invoices = await this.dataHandler.getInvoiceList();
      this.view.renderInvoiceList(this.invoices);
    } catch (error) {
      this.notification.show('Fail to load invoices', { type: 'error' });
    }
  }

  /**
   * Renders the create and edit forms using templates.
   */
  renderForms() {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.innerHTML = Templates.genericForm('create') + Templates.genericForm('edit');
    }
  }

  /**
   * Sets up event listeners for invoice actions, form events, and product list events.
   */
  setupEventListeners() {
    // Remove any existing listeners first
    const existingInvoiceList = this.view.invoiceList;
    const newInvoiceList = existingInvoiceList.cloneNode(true);
    existingInvoiceList.parentNode.replaceChild(newInvoiceList, existingInvoiceList);
    this.view.invoiceList = newInvoiceList;

    // Set up new listeners
    this.view.invoiceList.addEventListener(
      'click',
      (e) => {
        this.handleInvoiceActions(e);
      },
      { capture: true },
    ); // Use capture phase to handle event first

    this.setupAddInvoiceButton();
    this.setupSaveChangeButton();
    this.setupPopupMenu();
    this.setupMultipleInvoiceDeletion();

    formHandlers.setupFormEventListeners((newDiscount) => {
      this.discountPercentage = newDiscount;
      const tbody = this.getActiveFormTbody();
      if (tbody) {
        productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
      }
    });

    productHandlers.setupProductListHandlers(() => this.updatePreview());
  }

  /**
   * Sets up the event listener for the "Add Invoice" button.
   */
  setupAddInvoiceButton() {
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());
  }

  /**
   * Sets up the event listener for the "Save Changes" button.
   */
  setupSaveChangeButton() {
    document
      .querySelector('.form--edit .form__action-buttons--button-save')
      .addEventListener('click', () => this.saveChanges());
  }

  /**
   * Setup event listener to hide popup when user uses specific actions
   */
  setupPopupMenu() {
    // Single event delegation handler for all popups
    document.addEventListener('click', (e) => {
      // Close any active popups when clicking outside
      if (!e.target.closest('.popup-menu')) {
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }

      // Toggle popup when trigger is clicked
      if (e.target.closest('.btn-trigger')) {
        e.preventDefault();
        e.stopPropagation();
        const popup = e.target.closest('.table__row').querySelector('.popup-content');
        popup?.classList.toggle('active');
      }
    });

    // Close popup on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }
    });
  }

  /**
   *  Confirmation dialog for deleting invoices.
   * @param {number} count - The number of invoices to delete.
   * @param {string} [id = null] - The ID of the single invoice to delete (optional).
   * @returns {boolean} True if the user confirms the deletion, false otherwise.
   */
  async confirmDeletion(count, id = null) {
    const message =
      count > 1
        ? `Are you sure you want to delete ${count} selected invoice(s)?`
        : `Are you sure you want to delete invoice #${id}?`;

    return await this.notification.confirm(message, {
      type: 'warning',
      title: 'Delete Invoice',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }

  /**
   * Sets up event listeners for handling multiple invoice deletions.
   * This includes:
   * - Listening for changes to the header checkbox to select/deselect all invoices.
   * - Listening for clicks on the multiple deletion icon to delete selected invoices.
   * - Listening for individual delete button clicks using event delegation.
   */
  setupMultipleInvoiceDeletion() {
    this.tableBody = document.querySelector('.table__body');
    this.headerCheckbox = document.querySelector('.table__head .checkbox');
    this.deleteIcon = document.querySelector('.table__delete-icon');

    // Listen for header checkbox changes
    this.headerCheckbox?.addEventListener('change', this.handleHeaderCheckboxChange.bind(this));

    // Listen for bulk delete icon clicks
    this.deleteIcon?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const checkedRows = this.tableBody.querySelectorAll('.table__checkbox:checked');
      await this.handleInvoiceDeletion(Array.from(checkedRows));
    });
  }

  /**
   * Selects all checkbox invoice when users choose header checkbox
   */
  handleHeaderCheckboxChange(event) {
    const isChecked = event.target.checked;
    const rowCheckboxes = this.tableBody.querySelectorAll('.table__checkbox');

    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  /**
   * Handle deletion of invoices, for single or multiple invoice at same time
   * @param {Event,Array} identifier - event for single deletion or array of checkboxes for multiple deletion
   */
  async handleInvoiceDeletion(identifier) {
    try {
      // Handle both multiple deletion and single deletion cases
      if (Array.isArray(identifier)) {
        // Multiple deletion
        if (identifier.length === 0) {
          this.notification.show('Please select at least one invoice to delete', {
            type: 'warning',
          });
          return;
        }

        const confirmed = await this.confirmDeletion(identifier.length);
        if (confirmed) {
          // Get array of invoice IDs to delete
          const idsToDelete = identifier.map((checkbox) => {
            const row = checkbox.closest('.table__row');
            return row.querySelector('.btn--delete').dataset.id;
          });

          // Delete all products for these invoices first
          for (const invoiceId of idsToDelete) {
            const products = await this.dataHandler.getProductsByInvoiceId(invoiceId);
            await Promise.all(
              products.map((product) => this.dataHandler.deleteProduct(product.id)),
            );
          }

          // Delete all invoices
          await this.dataHandler.deleteMultipleInvoices(idsToDelete);

          // Update local state
          this.invoices = this.invoices.filter((invoice) => !idsToDelete.includes(invoice.id));
          this.headerCheckbox.checked = false;
          this.notification.show('Invoices deleted successfully', { type: 'success' });
        }
      } else {
        // Single deletion
        const deleteBtn = identifier.target.closest('.btn--delete');
        if (!deleteBtn) return;

        const invoiceId = deleteBtn.dataset.id;

        const confirmed = await this.confirmDeletion(1, invoiceId);
        if (confirmed) {
          // Delete all products for this invoice first
          const products = await this.dataHandler.getProductsByInvoiceId(invoiceId);
          await Promise.all(products.map((product) => this.dataHandler.deleteProduct(product.id)));

          // Delete the invoice
          await this.dataHandler.deleteInvoice(invoiceId);

          // Update local state
          this.invoices = this.invoices.filter((invoice) => invoice.id !== invoiceId);
          this.notification.show('Invoice deleted successfully', { type: 'success' });
        }
      }

      // Update view after any type of deletion
      this.view.renderInvoiceList(this.invoices);
      this.updateHeaderCheckbox();
    } catch (error) {
      console.error('Error deleting invoice(s):', error);
      this.notification.show('Failed to delete invoice(s)', { type: 'error' });
    }
  }

  /**
   * Return the tbody element of the active form (create form or edit form)
   * @return {HTMLElement}The tbody element of the active form, or null if no form is active.
   */
  getActiveFormTbody() {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    return activeForm?.querySelector('product-list__table tbody');
  }

  /**
   * Adds a new invoice based on the form data and product data.
   * Validates the form data and product data before creating the invoice.
   * Renders the updated invoice list and invoice preview.
   */
  async addInvoice() {
    const formData = formHandlers.collectFormData();
    if (!formData || !formHandlers.validateFormData(formData)) return;

    const products = productHandlers.collectProductData();
    if (products.length === 0) {
      this.notification.show('Please add at least one product to the invoice', { type: 'warning' });
      return;
    }

    // Validate complete invoice data
    const validation = this.validator.validateCompleteInvoice({
      ...formData,
      products,
    });

    if (!validation.isValid) {
      const errorMessages = this.validator.formatValidationErrors(validation.errors);
      errorMessages.forEach((message) => {
        this.notification.show(message, { type: 'error' });
      });
      return;
    }

    // Proceed with adding invoice if validation passes
    try {
      const invoice = await this.dataHandler.createInvoice({
        id: formData.id,
        name: formData.name,
        email: formData.email,
        date: formData.date,
        address: formData.address,
        status: formData.status,
        favorite: false,
      });
      const productPromises = products.map((product) =>
        this.dataHandler.addProduct({
          ...product,
          invoiceId: invoice.id,
        }),
      );
      await Promise.all(productPromises);

      this.invoices.push(invoice);
      this.view.renderInvoiceList(this.invoices);
      this.view.renderInvoicePreview(invoice);
      formHandlers.resetFormStates();
      this.notification.show('Invoice created successfully', { type: 'success' });
    } catch (error) {
      this.notification.show('Fail to create invoice', { type: 'error' });
    }
  }

  /**
   * Handles actions (edit, delete) on invoices in the invoice list.
   *
   * @param {Event} e - The event object.
   */
  async handleInvoiceActions(e) {
    const row = e.target.closest('.table__row');
    if (!row) return;

    const idCell = row.querySelector('[data-label="Invoice Id"]');
    if (!idCell) return;

    const id = idCell.textContent;

    // Handle delete button click
    if (e.target.closest('.btn--delete')) {
      e.preventDefault();
      e.stopPropagation();

      const popupContent = e.target.closest('.popup-content');
      await this.handleInvoiceDeletion(e);
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }

    // Handle edit button click
    if (e.target.closest('.btn--edit')) {
      e.preventDefault();
      e.stopPropagation();
      this.editInvoice(id);
      const popupContent = e.target.closest('.popup-content');
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }
  }

  /**
   * Update the state of the header checkbox base on the individual checkboxes
   * If all checkboxes are checked, header checkbox will be checked and vice versa
   */
  updateHeaderCheckbox() {
    const totalRows = this.tableBody.querySelectorAll('.table__checkbox').length;
    const checkedRows = this.tableBody.querySelectorAll(`${'.table__checkbox'}:checked`).length;

    this.headerCheckbox.checked = totalRows > 0 && totalRows === checkedRows;
  }

  /**
   * Edits an invoice by its ID
   * Show edit form and populate it with the invoice data
   * @param {string} id - the ID of the invoice to edit
   */
  async editInvoice(id) {
    try {
      //get invoice from server
      const invoice = await this.dataHandler.getInvoiceById(id);
      if (!invoice) {
        this.notification.show('Invoice not found', { type: 'error' });
        return;
      }
      // get product data for this invoice
      const products = await this.dataHandler.getProductsByInvoiceId(id);
      // show edit form and populate data
      formHandlers.showEditForm();
      formHandlers.setFormData(invoice, this.discountPercentage);

      // populate product data into tbody
      const tbody = document.querySelector(
        '.form--edit .product-list__table .product-list__table-body',
      );
      // clear any existing row
      if (tbody) {
        tbody.innerHTML = '';

        //add product row
        products.forEach((product) => {
          //retrieve product template
          const row = Templates.addProductPriceCalculation(product);
          tbody.insertAdjacentHTML('beforeend', row);
        });
        //update total
        productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
      }
      //update preview with full invoice data + products
      const fullInvoice = {
        ...invoice,
        products: products,
      };
      this.view.renderInvoicePreview(fullInvoice);
    } catch (error) {
      console.error('Error loading invoice from editing', error);
      this.notification.show('fail to load invoice data', { type: 'error' });
    }
  }

  /**
   * Saves changes to an existing invoice based on the form data and product data
   * Validates form and product data before updating the invoice
   * Render the updated invoice list and invoice preview
   */
  async saveChanges() {
    const formData = formHandlers.collectFormData();
    const products = productHandlers.collectProductData();

    if (products.length === 0) {
      this.notification.show('Please add at least one product to the invoice', { type: 'warning' });
      return;
    }

    // Validate complete invoice data
    const validation = this.validator.validateCompleteInvoice({
      ...formData,
      products,
    });

    if (!validation.isValid) {
      const errorMessages = this.validator.formatValidationErrors(validation.errors);
      errorMessages.forEach((message) => {
        this.notification.show(message, { type: 'error' });
      });
      return;
    }

    try {
      const updatedInvoice = await this.dataHandler.updateInvoice(formData.id, {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        date: formData.date,
        address: formData.address,
        status: formData.status,
        favorite: this.invoices.find((inv) => (inv.id === formData.id)?.favorite || false),
      });
      const existingProducts = await this.dataHandler.getProductsByInvoiceId(formData.id);

      await Promise.all(
        existingProducts.map((product) => {
          this.dataHandler.deleteProduct(product.id);
        }),
      );

      await Promise.all(
        products.map((product) =>
          this.dataHandler.addProduct({
            ...product,
            invoiceId: formData.id,
          }),
        ),
      );
      const index = this.invoices.findIndex((inv) => inv.id === formData.id);
      if (index !== -1) {
        this.invoices[index] = {
          ...updatedInvoice,
          products: products,
        };
      }
      this.view.renderInvoiceList(this.invoices);
      this.view.renderInvoicePreview(this.invoices[index]);
      this.notification.show('Invoice updated successfully', { type: 'success' });
      formHandlers.resetFormStates();
    } catch (error) {
      console.error('Error updating invoice', error);
      this.notification.show('Fail to update invoice', { type: 'error' });
    }
  }

  /**
   * Updates the invoice preview based on the current form data and product data.
   *  Uses try/catch to log an error if the preview update fails.
   */
  updatePreview() {
    const formData = formHandlers.collectFormData();
    if (!formData) return;

    const products = productHandlers.collectProductData();

    try {
      // Only create preview if there are products or the form is actively being edited
      if (products.length > 0 || document.querySelector('.form--edit:not(.hidden)')) {
        const tempInvoice = new Invoice(
          formData.id,
          formData.name,
          formData.email,
          formData.date,
          formData.address,
          formData.status,
          products,
        );
        this.view.renderInvoicePreview(tempInvoice);
      } else {
        // Clear the preview if there are no products
        this.view.clearInvoicePreview();
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }

  /**
   * Sets up the search functionality for invoices
   */
  setupSearchInvoice() {
    const searchInput = document.querySelector('.search__input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  /**
   * Handles the search functionality
   * @param {string} searchInput - the search term entered by user
   */

  handleSearch(searchInput) {
    if (!searchInput) {
      this.view.renderInvoiceList(this.invoices);
      return;
    }
    const formatSearchInput = searchInput.toLowerCase().trim();
    const filteredInvoices = this.invoices.filter((invoice) => {
      return (
        //Search by ID
        invoice.id.toLowerCase().includes(formatSearchInput) ||
        //Search by name
        invoice.name.toLowerCase().includes(formatSearchInput) ||
        //Search by email
        invoice.email.toLowerCase().includes(formatSearchInput) ||
        // Search by date
        invoice.date.toLowerCase().includes(formatSearchInput) ||
        //Search by status
        invoice.status.toLowerCase().includes(formatSearchInput)
      );
    });
    this.view.renderInvoiceList(filteredInvoices);
    //Update header checkbox after filtering
    this.updateHeaderCheckbox();
  }

  setupSortHandlers() {
    const tableHeaders = document.querySelectorAll('.table__header[data-field]');
    let currentSortField = null;
    let currentSortOrder = null;

    tableHeaders.forEach((header) => {
      header.addEventListener('click', (e) => {
        // Close any open popups when sorting
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));

        const field = header.getAttribute('data-field');
        if (!field) return;

        let newOrder;
        if (field === currentSortField) {
          newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          newOrder = 'asc';
        }

        this.updateSortIcon(header, newOrder);

        currentSortField = field;
        currentSortOrder = newOrder;
        const sortedInvoices = this.sortInvoices(field, newOrder);
        this.view.renderInvoiceList(sortedInvoices);
      });
    });
  }

  updateSortIcon(activeHeader, order) {
    //Clear the current sort state
    const sortIcons = document.querySelectorAll('.sort-icon');
    sortIcons.forEach((icon) => {
      icon.classList.remove('ascending', 'descending');
    });
    // add icon based on current order
    const activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
      activeIcon.classList.add(order === 'asc' ? 'ascending' : 'descending');
    }
  }

  sortInvoices(field, order = 'asc') {
    //Avoid mutating original data
    const sortedInvoices = [...this.invoices];
    //Sort based on field and order
    sortedInvoices.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      // Handle null or undefined values
      if (valA == null) valA = '';
      if (valB == null) valB = '';

      //Special handling for date type data
      if (field === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
        return order === 'asc' ? valA - valB : valB - valA;
      }
      //format string type
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      //Sort logic
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedInvoices;
  }

  setupFavoriteHandler() {
    this.view.invoiceList.addEventListener('click', (e) => {
      const favoriteIcon = e.target.closest('.favorite-icon-inactive, .favorite-icon-active');
      //Toggle favorite state
      if (!favoriteIcon) return;
      const isActive = favoriteIcon.classList.contains('favorite-icon-active');
      const row = favoriteIcon.closest('.table__row');
      const invoiceId = row.querySelector('[data-label="Invoice Id"]').textContent;

      //Update icon src and classname
      favoriteIcon.src = isActive
        ? './assets/images/icons/main-view-icons/favorite-icon-inactive.svg'
        : './assets/images/icons/main-view-icons/favorite-icon-active.svg';

      favoriteIcon.classList.toggle('favorite-icon-inactive', isActive);
      favoriteIcon.classList.toggle('favorite-icon-active', !isActive);

      //Update invoice data
      const invoice = this.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.favorite = !isActive;
      }
    });
  }
}

export default InvoiceController;
