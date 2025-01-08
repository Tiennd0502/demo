import Templates from '../templates/templates.js';

export function setupProductListHandlers(onAmountsUpdate) {
  setupAddProductButtons();
  setupProductTableListeners(onAmountsUpdate);
}

export function setupAddProductButtons() {
  const addProductBtns = document.querySelectorAll('.product-list__action-button--button-add');
  addProductBtns.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => handleAddProduct());
  });
}

export function setupProductTableListeners(onAmountsUpdate) {
  const forms = document.querySelectorAll('.form--create, .form--edit');
  forms.forEach((form) => {
    const tbody = form.querySelector('.product-list__table tbody');
    setupDeleteButtonListeners(tbody, onAmountsUpdate);
    setupInputChangeListeners(tbody, onAmountsUpdate);
  });
}

export function setupDeleteButtonListeners(tbody, onAmountsUpdate) {
  tbody.addEventListener('click', (e) => {
    if (e.target.closest('.product-list__action-button--button-delete')) {
      handleDeleteProduct(e, tbody, onAmountsUpdate);
    }
  });
}

export function setupInputChangeListeners(tbody, onAmountsUpdate) {
  tbody.addEventListener('input', (e) => {
    if (e.target.matches('.rate-input, .qty-input')) {
      updateAmounts(tbody, onAmountsUpdate);
    }
  });
}

export function handleAddProduct() {
  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (activeForm) {
    const tbody = activeForm.querySelector('.product-list__table tbody');
    addProductRow(tbody);
  }
}

export function handleDeleteProduct(e, tbody, onAmountsUpdate) {
  const row = e.target.closest('tr');
  if (tbody.children.length > 1) {
    row.remove();
  } else {
    row.querySelectorAll('input').forEach((input) => (input.value = ''));
  }
  updateAmounts(tbody, onAmountsUpdate);
}

export function addProductRow(tbody) {
  tbody.insertAdjacentHTML('beforeend', Templates.addProductRowTemplate);
}

export function updateAmounts(tbody, onAmountsUpdate, discountPercentage = 5) {
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.product-list__table-row');
  updateRowAmounts(rows);
  const { subtotal, discountAmount, total } = calculateTotals(rows, discountPercentage);
  updatePreviewTotals(subtotal, discountAmount, total);
  onAmountsUpdate?.();
}

function updateRowAmounts(rows) {
  rows.forEach((row) => {
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const qty = parseInt(row.querySelector('.qty-input').value) || 0;
    const amount = rate * qty;
    row.querySelector('td:nth-child(4)').textContent = `$${amount.toFixed(2)}`;
  });
}

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

export function setProductData(products, tbody) {
  tbody.innerHTML = products
    .map((product) => Templates.addProductPriceCalculation(product))
    .join('');
}
