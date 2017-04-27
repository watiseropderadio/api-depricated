import { Controller } from 'lux-framework';

class SongsController extends Controller {
  params = [
    'play',
    'slug',
    'title',
    'songTitle',
    'artistSong'
  ];
}

export default SongsController;
