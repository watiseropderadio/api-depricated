import { Controller } from 'lux-framework';
import addCopyright from 'app/middleware/add-copyright';

class ApplicationController extends Controller {
  afterAction = [
    addCopyright
  ];
}

export default ApplicationController;
