import Play from '../app/models/play';
import Song from '../app/models/song';
import SongTitle from '../app/models/song-title';
import Artist from '../app/models/artist';
import ArtistName from '../app/models/artist-name';
import ArtistSong from '../app/models/artist-song';

export default async function seed(trx) {
  await Promise.all([
    Song.transacting(trx).create({
      slug: 'pokerface',
      play: [1,3]
    }),
    Song.transacting(trx).create({
      slug: 'where-is-the-love',
      play: [2]
    }),
    SongTitle.transacting(trx).create({
      songId: 1,
      title: 'Pokerface'
    }),
    SongTitle.transacting(trx).create({
      songId: 2,
      title: 'Where Is The Love'
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

    Artist.transacting(trx).create({
      artistSongId: 1,
      artistNameId: 1
    }),
    ArtistSong.transacting(trx).create({
      songId: 1,
      artistId: 1
    }),
    ArtistName.transacting(trx).create({
      name: 'Lady Gaga',
      artistId: 1
    }),
    ArtistName.transacting(trx).create({
      name: 'Ladie Gaga',
      artistId: 1
    }),
  ]);
}
