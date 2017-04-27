export default function routes() {
  // this.resource('plays');
  this.resource('plays', function () {
    this.get('tralala');
  });
  this.resource('songs');
  this.resource('song-titles');
  this.resource('artists');
  this.resource('artist-names');
  this.resource('artist-songs');
}
