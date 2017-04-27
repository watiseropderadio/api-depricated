import { Serializer } from 'lux-framework';

class ArtistNamesSerializer extends Serializer {
  attributes = [
    'name'
  ];

  hasOne = [
    'artist'
  ];
}

export default ArtistNamesSerializer;
