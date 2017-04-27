import { Serializer } from 'lux-framework';

class PlaysSerializer extends Serializer {
  attributes = [
    'playedAt',
    'exact'
  ];

  hasOne = [
    'song'
  ];
}

export default PlaysSerializer;
