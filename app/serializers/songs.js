import { Serializer } from 'lux-framework';

class SongsSerializer extends Serializer {
  attributes = [
    'slug',
    'title'
  ];

  hasMany = [
    'plays',
    'songTitles',
    'artistSongs'
  ];
}

export default SongsSerializer;
