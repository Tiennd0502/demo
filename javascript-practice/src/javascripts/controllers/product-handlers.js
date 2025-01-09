import Templates from '../templates/templates.js';

/**
 * Sets up event listeners for product list actions.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupProductListHandlers(onAmountsUpdate) {
  setupAddProductButtons();
  setupProductTableListeners(onAmountsUpdate);
}

/**
 * Sets up event listeners for the add product buttons.
 */
export function setupAddProductButtons() {
  const addProductBtns = document.querySelectorAll('.product-list__action-button--button-add');
  addProductBtns.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    newBtn.replaceWith(newBtn.cloneNode(true));
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => handleAddProduct());
  });
}

/**
 * Sets up event listeners for the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupProductTableListeners(onAmountsUpdate) {
  console.log('Setting up product table listeners');
  const forms = document.querySelectorAll('.form--create, .form--edit');
  forms.forEach((form) => {
    const tbody = form.querySelector('.product-list__table tbody');
    setupDeleteButtonListeners(tbody, onAmountsUpdate);
    setupInputChangeListeners(tbody, onAmountsUpdate);
  });
}

/**
 * Sets up event listeners for the delete buttons in the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupDeleteButtonListeners(tbody, onAmountsUpdate) {
  tbody.addEventListener('click', (e) => {
    if (e.target.closest('.product-list__action-button--button-delete')) {
      handleDeleteProduct(e, tbody, onAmountsUpdate);
    }
  });
}

/**
 * Sets up event listeners for input changes in the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function setupInputChangeListeners(tbody, onAmountsUpdate) {
  tbody.addEventListener('input', (e) => {
    if (e.target.matches('.rate-input, .qty-input')) {
      updateAmounts(tbody, onAmountsUpdate);
    }
  });
}

/**
 * Handles the addition of a new product row to the product table.
 */
export function handleAddProduct() {
  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (activeForm) {
    const tbody = activeForm.querySelector('.product-list__table tbody');
    addProductRow(tbody);
  }
}

/**
 * Handles the deletion of a product row from the product table.
 * @param {Event} e - The event object.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function handleDeleteProduct(e, tbody, onAmountsUpdate) {
  const row = e.target.closest('tr');
  row.remove(); // Remove the row
  updateAmounts(tbody, onAmountsUpdate);
}

/**
 * Adds a new product row to the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 */
export function addProductRow(tbody) {
  tbody.insertAdjacentHTML('beforeend', Templates.addProductRowTemplate);
}

/**
 * Updates the amounts in the product table.
 * @param {HTMLElement} tbody - The tbody element of the product table.
 * @param {Function} onAmountsUpdate - Callback function to handle updates to amounts.
 */
export function updateAmounts(tbody, onAmountsUpdate, discountPercentage = 5) {
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.product-list__table-row');
  updateRowAmounts(rows);
  const { subtotal, discountAmount, total } = calculateTotals(rows, discountPercentage);
  updatePreviewTotals(subtotal, discountAmount, total);
  if (rows.length === 0) {
    clearPreviewProducts();
  }

  onAmountsUpdate?.();
}

/**
 * Clears the products from the preview section
 */
function clearPreviewProducts() {
  const previewProducts = document.querySelector('.preview-product-list');
  if (previewProducts) {
    previewProducts.innerHTML = '';
  }
}

/**
 * Updates the amounts for each row in the product table.
 * @param {NodeList} rows - The rows of the product table.
 */
function updateRowAmounts(rows) {
  rows.forEach((row) => {
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const qty = parseInt(row.querySelector('.qty-input').value) || 0;
    const amount = rate * qty;
    row.querySelector('td:nth-child(4)').textContent = `$${amount.toFixed(2)}`;
  });
}

/**
 * Calculates the totals for the product table, including the discount.
 * @param {NodeList} rows - The rows of the product table.
 * @param {number} discountPercentage - The discount percentage to apply.
 * @returns {Object} An object containing the subtotal, discount amount, and total.
 */
function calculateTotals(rows, discountPercentage) {
  let subtotal = 0;
  rows.forEach((row) => {
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const qty = parseInt(row.querySelector('.qty-input').value) || 0;
    subtotal += rate * qty;
  });

  const discountAmount = (subtotal * discountPercentage) / 100;
  const total = subtotal - discountAmount;

  return { subtotal, discountAmount, total };
}

/**
 * Updates the preview totals in the invoice summary.
 * @param {number} subtotal - The subtotal amount.
 * @param {number} discountAmount - The discount amount.
 * @param {number} total - The total amount after discount.
 */
function updatePreviewTotals(subtotal, discountAmount, total) {
  const previewSection = document.querySelector('.preview-summary');
  if (previewSection) {
    previewSection.querySelector(
      '.preview-summary__row:nth-child(1) .preview-summary__value',
    ).textContent = `$${subtotal.toFixed(2)}`;
    previewSection.querySelector(
      '.preview-summary__row:nth-child(2) .preview-summary__value',
    ).textContent = `$${discountAmount.toFixed(2)}`;
    previewSection.querySelector('.preview-summary__total .preview-summary__value').textContent =
      `$${total.toFixed(2)}`;
  }
}

/**
 * Collects product data from the product table.
 * @returns {Array<Object>} An array of product objects.
 */
export function collectProductData() {
  const products = [];
  const rows = document.querySelectorAll(
    '.product-list__table .product-list__table-body .product-list__table-row',
  );

  rows.forEach((row) => {
    const name = row.querySelector('.product-input').value.trim();
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const quantity = parseInt(row.querySelector('.qty-input').value) || 0;

    if (name || rate || quantity) {
      products.push({
        name,
        rate,
        quantity,
        amount: rate * quantity,
      });
    }
  });

  return products;
}

/**
 * sets product data in product table
 * @param {Array[Object]} products - Array of product object
 * @param {HTMLElement} tbody - the body of product table
 */
export function setProductData(products, tbody) {
  tbody.innerHTML = products
    .map((product) => Templates.addProductPriceCalculation(product))
    .join('');
}
