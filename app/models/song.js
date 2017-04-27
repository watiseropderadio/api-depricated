import { Model } from 'lux-framework';

class Song extends Model {
  static hasMany = {
    play: {
      inverse: 'song'
    },

    songTitle: {
      inverse: 'song'
    },

    artistSong: {
      inverse: 'song'
    }
  };
}

export default Song;
