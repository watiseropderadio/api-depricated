import { Model } from 'lux-framework';

class Play extends Model {
  static belongsTo = {
    song: {
      inverse: 'play'
    }
  };
}

export default Play;
