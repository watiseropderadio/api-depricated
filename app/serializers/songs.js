import { Serializer } from 'lux-framework';

class SongsSerializer extends Serializer {
  attributes = [
    'slug',
    'title'
  ];

  hasMany = [
    'play',
    'songTitle',
    'artistSong'
  ];
}

export default SongsSerializer;
