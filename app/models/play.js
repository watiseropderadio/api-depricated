import { Model } from 'lux-framework';

class Play extends Model {
  static belongsTo = {
    song: {
      inverse: 'plays'
    }
  };
}

export default Play;
