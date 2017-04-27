import { Serializer } from 'lux-framework';

class ArtistSongsSerializer extends Serializer {
  hasOne = [
    'song',
    'artist'
  ];
}

export default ArtistSongsSerializer;
