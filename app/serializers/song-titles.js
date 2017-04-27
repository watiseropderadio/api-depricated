import { Serializer } from 'lux-framework';

class SongTitlesSerializer extends Serializer {
  attributes = [
    'title'
  ];

  hasOne = [
    'song'
  ];
}

export default SongTitlesSerializer;
