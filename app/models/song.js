import { Model } from 'lux-framework';

class Song extends Model {
  static hasMany = {
    plays: {
      inverse: 'song'
    },

    songTitles: {
      inverse: 'song'
    },

    artistSongs: {
      inverse: 'song'
    }
  };
}

export default Song;
