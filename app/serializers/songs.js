import { Serializer } from 'lux-framework';

class SongsSerializer extends Serializer {
  attributes = [
    'slug',
    'title'
  ];

  hasMany = [
    'play'
  ];
}

export default SongsSerializer;
