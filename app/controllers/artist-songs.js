import { Controller } from 'lux-framework';

class ArtistSongsController extends Controller {
  params = [
    'song',
    'artist'
  ];
}

export default ArtistSongsController;
