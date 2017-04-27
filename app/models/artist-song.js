import { Model } from 'lux-framework';

class ArtistSong extends Model {
  static belongsTo = {
    song: {
      inverse: 'artistSong'
    },

    artist: {
      inverse: 'artistSong'
    }
  };
}

export default ArtistSong;
