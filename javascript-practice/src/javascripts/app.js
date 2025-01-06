import Invoice from './model/model.js';
import InvoiceView from './views/view.js';
import InvoiceController from './controllers/controller.js';
class App {
  init() {
    this.invoice = new Invoice();
    this.invoiceView = new InvoiceView();

    this.invoiceController = new InvoiceController(this.invoice, this.invoiceView);
    this.invoiceController.init();
  }
}
export default App;
