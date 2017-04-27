import { Controller } from 'lux-framework';

class SongsController extends Controller {
  params = [
    'play',
    'slug',
    'title'
  ];
}

export default SongsController;
