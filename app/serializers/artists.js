import { Serializer } from 'lux-framework';

class ArtistsSerializer extends Serializer {
  hasMany = [
    'artistSongs',
    'artistNames'
  ];
}

export default ArtistsSerializer;
