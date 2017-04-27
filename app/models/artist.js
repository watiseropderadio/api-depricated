import { Model } from 'lux-framework';

class Artist extends Model {
  static hasMany = {
    artistSongs: {
      inverse: 'artist'
    },

    artistNames: {
      inverse: 'artist'
    }
  };
}

export default Artist;
