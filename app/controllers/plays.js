import { Controller } from 'lux-framework';

class PlaysController extends Controller {
  params = [
    'song',
    'playedAt',
    'exact'
  ];
}

export default PlaysController;
