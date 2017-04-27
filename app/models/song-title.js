import { Model } from 'lux-framework';

class SongTitle extends Model {
  static belongsTo = {
    song: {
      inverse: 'songTitles'
    }
  };
}

export default SongTitle;
