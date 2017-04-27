import { Model } from 'lux-framework';

class Artist extends Model {
  static hasMany = {
    artistSong: {
      inverse: 'artist'
    },

    artistName: {
      inverse: 'artist'
    }
  };
}

export default Artist;
