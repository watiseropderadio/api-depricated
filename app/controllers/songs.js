import { Controller } from 'lux-framework';

class SongsController extends Controller {
  params = [
    'play',
    'slug',
    'title',
    'songTitle',
    'artistSong'
  ];

  beforeAction = [
    (request, response) => {
      const { action } = request;
      if (['show', 'index'].indexOf(action) > -1) {
        request.params.include = 'songTitles,artistSongs';
      }
    }
  ];

  index() {
    return false;
  }
}

export default SongsController;
