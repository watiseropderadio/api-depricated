import { Controller } from 'lux-framework';
import Play from 'app/models/play';

class PlaysController extends Controller {
  params = [
    'song',
    'playedAt',
    'exact'
  ];

  // This returns empty objects in an array
  tralala() {
    return Play.where({
      exact: false
    });
  };

  // This throws "TypeError: Cannot convert undefined or null to object"
  tralala(request, response) {
    return super.index(request, response).where({
      exact: true
    });
  };
}

export default PlaysController;
