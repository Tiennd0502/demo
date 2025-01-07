export const createInvoiceFormTemplate = () => `
<div class="form--create">
    <div class="form__header">
      <h3 class="form__header-title">Create New Invoice</h3>
      <button class="btn form__header-close">
        <img
          src="./assets/images/icons/create-invoice-modal-icons/close-icon.png"
          alt="close icon"
        />
      </button>
    </div>

    <div class="form__camera">
      <img
        class="form__camera-icon"
        src="./assets/images/icons/create-invoice-modal-icons/camera-icon.svg"
        alt="picture icon"
      />
    </div>

    <div class="form-grid">
      <div class="form__group">
        <label class="form__group-label">Invoice ID</label>
        <input class="form__group-input" type="text" placeholder="#876370" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Date</label>
        <input class="form__group-input" type="date" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Name</label>
        <input class="form__group-input" type="text" placeholder="Alison G." />
      </div>
      <div class="form__group">
        <label class="form__group-label">Email</label>
        <input class="form__group-input" type="email" placeholder="example@gmail.com" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Address</label>
        <div class="form__group-address">
          <input class="form__group-input" type="text" placeholder="Street" />
          <img
            class="form__group-address-icon"
            src="./assets/images/icons/create-invoice-modal-icons/location-icon.svg"
            alt="location icon"
          />
        </div>
      </div>
    </div>

    <div class="product-list">
      <div class="product-list__title">
        <h4 class="product-list__title-text">Product Description</h4>
        <button class="btn product-list__action-buttons product-list__action-button--button-add">
          +
        </button>
      </div>
      <table class="product-list__table">
        <thead class="product-list__table-head">
          <tr class="product-list__table-row">
            <th class="product-list__header">Product Name</th>
            <th class="product-list__header">Rate</th>
            <th class="product-list__header">Qty</th>
            <th class="product-list__header">Amount</th>
            <th class="product-list__header"></th>
          </tr>
        </thead>
        <tbody class="product-list__table-body"></tbody>
      </table>
    </div>

    <div class="form__action-buttons">
      <button class="btn form__action-buttons--button-send">Send Invoice</button>
      <button class="btn form__action-buttons--button-create">Create Invoice</button>
    </div>
  </div>
`;

export const editInvoiceFormTemplate = () => `
  <div class="form--edit hidden">
    <div class="form__header">
      <h3 class="form__header-title">Edit This Invoice</h3>
      <button class="btn form__header-close">
        <img
          src="./assets/images/icons/create-invoice-modal-icons/close-icon.png"
          alt="close icon"
        />
      </button>
    </div>

    <div class="form__camera">
      <img
        class="form__camera-icon"
        src="./assets/images/icons/create-invoice-modal-icons/camera-icon.svg"
        alt="picture icon"
      />
    </div>

    <div class="form-grid">
      <div class="form__group">
        <label class="form__group-label">Invoice ID</label>
        <input class="form__group-input" type="text" placeholder="#876370" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Date</label>
        <input class="form__group-input" type="date" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Name</label>
        <input class="form__group-input" type="text" placeholder="Alison G." />
      </div>
      <div class="form__group">
        <label class="form__group-label">Email</label>
        <input class="form__group-input" type="email" placeholder="example@gmail.com" />
      </div>
      <div class="form__group">
        <label class="form__group-label">Address</label>
        <div class="form__group-address">
          <input class="form__group-input" type="text" placeholder="Street" />
          <img
            class="form__group-address-icon"
            src="./assets/images/icons/create-invoice-modal-icons/location-icon.svg"
            alt="location icon"
          />
        </div>
      </div>
    </div>

    <div class="product-list">
      <div class="product-list__title">
        <h4 class="product-list__title-text">Product Description</h4>
        <button class="btn product-list__action-buttons product-list__action-button--button-add">
          +
        </button>
      </div>
      <table class="product-list__table">
        <thead class="product-list__table-head">
          <tr class="product-list__table-row">
            <th class="product-list__header">Product Name</th>
            <th class="product-list__header">Rate</th>
            <th class="product-list__header">Qty</th>
            <th class="product-list__header">Amount</th>
            <th class="product-list__header"></th>
          </tr>
        </thead>
        <tbody class="product-list__table-body"></tbody>
      </table>
    </div>

    <div class="form__action-buttons">
      <button class="btn form__action-buttons--button-send">Send Invoice</button>
      <button class="btn form__action-buttons--button-save">Save Changes</button>
    </div>
  </div>
`;

export const invoiceTableTemplate = () => `
  <table class="table__content">
    <thead class="table__head">
      <tr class="table__row">
        <th class="table__header"><input type="checkbox" class="checkbox" /></th>
        <th class="table__header">
          <div class="table__header-content">
            <span>Invoice Id</span>
            <img
              class="table__sort-icon"
              src="./assets/images/icons/main-view-icons/sort-arrow-icon.svg"
              alt="sort icon"
            />
          </div>
        </th>
        <th class="table__header">
          <div class="table__header-content">
            <span>Name</span>
            <img
              class="table__sort-icon"
              src="./assets/images/icons/main-view-icons/sort-arrow-icon.svg"
              alt="sort icon"
            />
          </div>
        </th>
        <th class="table__header">
          <div class="table__header-content">
            <span>Email</span>
            <img
              class="table__sort-icon"
              src="./assets/images/icons/main-view-icons/sort-arrow-icon.svg"
              alt="sort icon"
            />
          </div>
        </th>
        <th class="table__header">
          <div class="table__header-content">
            <span>Date</span>
            <img
              class="table__sort-icon"
              src="./assets/images/icons/main-view-icons/sort-arrow-icon.svg"
              alt="sort icon"
            />
          </div>
        </th>
        <th class="table__header">
          <div class="table__header-content">
            <span>Status</span>
            <img
              class="table__sort-icon"
              src="./assets/images/icons/main-view-icons/sort-arrow-icon.svg"
              alt="sort icon"
            />
          </div>
        </th>
        <th></th>
        <th class="table__header">
          <img
            class="table__delete-icon"
            src="./assets/images/icons/main-view-icons/delete-icon.svg"
            alt="Deletion icon"
          />
        </th>
      </tr>
    </thead>
    <tbody class="table__body"></tbody>
  </table>
`;

export const previewTemplate = () => `
  <div class="preview__header">
    <h2 class="preview__header-title">Preview</h2>
    <div class="preview__main__actions">
      <a href="javascript:void(0)">
        <img
          src="./assets/images/icons/preview-section-icons/download-icon.svg"
          alt="download icon"
        />
      </a>
      <a href="javascript:void(0)">
        <img
          src="./assets/images/icons/preview-section-icons/print-icon.svg"
          alt="printer icon"
        />
      </a>
    </div>
  </div>

  <div class="preview__content">
    <div class="preview__customer">
      <div class="preview__customer-logo">J</div>
      <div class="preview__customer-info">
        <div class="preview__customer-email">
          @ <span class="email-address">your.mail@gmail.com</span>
        </div>
        <div class="preview__customer-phone">
          m <span class="phone-number">+388 953 217 3815</span>
        </div>
      </div>
    </div>

    <div class="preview__invoice">
      <div class="preview__invoice-details">
        <div class="recipient-details">
          <span class="recipient__info">recipient</span><br />
          <div class="contact-details">
            <p class="recipient__name"></p>
            <p class="recipient__address"></p>
          </div>
          <div class="preview-company__info">
            <div class="preview-company__email">@ <span class="email-address"> </span></div>
            <div class="preview-company__phone">
              m <span class="phone-number"> +386 714 505 8385</span>
            </div>
          </div>
        </div>

        <div class="preview__invoice-header">
          <div class="preview__invoice-title">Invoice</div>
          <div class="invoice-number">
            <div class="preview__invoice-label--id"></div>
            <div class="preview__invoice-label--date"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <table class="preview-table">
    <thead>
      <tr class="preview-table__row">
        <th class="product-list__header">Product Description</th>
        <th class="product-list__header">Rates</th>
        <th class="product-list__header">Qty</th>
        <th class="product-list__header">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr class="preview-table__row"></tr>
    </tbody>
  </table>

  <div class="preview-summary">
    <div class="preview-summary__row">
      <span class="preview-summary__label">Subtotal:</span>
      <span class="preview-summary__value">$</span>
    </div>
    <div class="preview-summary__row">
      <span class="preview-summary__label">Discount (5%):</span>
      <span class="preview-summary__value">$</span>
    </div>
    <div class="preview-summary__row preview-summary__total">
      <span class="preview-summary__label">Total:</span>
      <span class="preview-summary__value">$</span>
    </div>
  </div>

  <div class="preview-footer">
    <div class="preview-footer__payment">
      <p>to the business account below. Please include invoice number on your check.</p>
      <p class="payment__bank-acc">
        BANK:
        <span class="bank-acc__info"> FTSBUS33</span>
        IBAN: <span class="bank-acc__info"> GB82-1111-2222-3333</span>
      </p>
    </div>

    <div class="preview-footer__notes">
      <h3 class="notes__header">NOTES</h3>
      <p class="notes__content">
        All amounts are in dollars. Please make the payment within 15 days from the issue of
        date of this invoice. Tax is not charged on the basis of paragraph 1 of Article 94
        of the Value Added Tax Act (I am not liable for VAT).
      </p>
      <p>Thank you for your confidence in my work.<br />Signature</p>
    </div>

    <div class="preview-footer__company">
      <div class="preview-footer__company-details">
        <p>YOUR COMPANY</p>
        <p>1331 Hart Ridge Road, 49436 Gaines, MI</p>
      </div>
      <div class="preview__customer-info">
        <div class="preview__customer-email">
          @ <span class="email-address">your.mail@gmail.com</span>
        </div>
        <div class="preview__customer-phone">
          m <span class="phone-number">+388 953 217 3815</span>
        </div>
      </div>

      <div class="preview-footer__company-copyright">
        <p>The company is registered in the<br />business register under no. 87600000</p>
      </div>
    </div>
  </div>
`;
