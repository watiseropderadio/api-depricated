import { Model } from 'lux-framework';

class ArtistName extends Model {
  static belongsTo = {
    artist: {
      inverse: 'artistName'
    }
  };
}

export default ArtistName;
