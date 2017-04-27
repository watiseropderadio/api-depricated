import { Model } from 'lux-framework';

class ArtistName extends Model {
  static belongsTo = {
    artist: {
      inverse: 'artistNames'
    }
  };
}

export default ArtistName;
