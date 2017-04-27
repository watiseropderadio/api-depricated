import { Model } from 'lux-framework';

class Song extends Model {
  static hasMany = {
    play: {
      inverse: 'song'
    }
  };
}

export default Song;
