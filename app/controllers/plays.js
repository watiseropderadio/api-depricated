import { Controller } from 'lux-framework';
import Play from 'app/models/play';

class PlaysController extends Controller {
  params = [
    'song',
    'playedAt',
    'exact'
  ];

  // This returns empty objects in an array
  test1() {
    return Play.where({
      exact: false
    });
  };

  // This throws "TypeError: Cannot convert undefined or null to object"
  test2(request, response) {
    return super.index(request, response);
  };
}

export default PlaysController;
