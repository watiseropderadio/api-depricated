import Play from '../app/models/play';
import Song from '../app/models/song';
// import Title from '../app/models/title';
// import range from '../app/utils/range';

export default async function seed(trx) {
  await Promise.all([
    Song.transacting(trx).create({
      slug: 'pokerface',
      title: 'Pokerface',
      play: [1,3]
    }),
    Song.transacting(trx).create({
      slug: 'where-is-the-love',
      title: 'Where Is The Love',
      play: [2]
    }),

    Play.transacting(trx).create({
      playedAt: new Date(),
      exact: true,
      songId: 1
    }),
    Play.transacting(trx).create({
      playedAt: new Date(),
      exact: false,
      songId: 2
    }),
    Play.transacting(trx).create({
      playedAt: new Date(),
      exact: true,
      songId: 1
    }),
  ]);
}
