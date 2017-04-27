import { Model } from 'lux-framework';

class ArtistSong extends Model {
  static belongsTo = {
    song: {
      inverse: 'artistSongs'
    },

    artist: {
      inverse: 'artistSongs'
    }
  };
}

export default ArtistSong;
