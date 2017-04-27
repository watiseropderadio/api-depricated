import { Serializer } from 'lux-framework';

class ArtistsSerializer extends Serializer {
      hasMany = [
    'artistSong',
    'artistName'
  ];
}

export default ArtistsSerializer;
