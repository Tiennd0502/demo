import Invoice from '../model/model.js';
import InvoiceView from '../views/view.js';
class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.invoices = [];

    this.init();
  }

  init() {}
}
export default InvoiceController;
