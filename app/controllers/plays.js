import { Controller } from 'lux-framework';
import Play from 'app/models/play';

class PlaysController extends Controller {
  params = [
    'song',
    'playedAt',
    'exact'
  ];

  beforeAction = [
    (request, response) => {
      const { action } = request;
      if (['show', 'index'].indexOf(action) > -1) {
        request.params.include = 'song';
      }
    }
  ];

  // This returns empty objects in an array
  test1() {
    return Play.where({
      exact: false
    });
  };

  // This throws "TypeError: Cannot convert undefined or null to object"
  test2(request, response) {
    return this.index(request, response);
  };
}

export default PlaysController;
