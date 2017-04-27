export default function routes() {
  // this.resource('plays');
  this.resource('plays', function () {
    this.get('test1');
    this.get('test2');
  });
  this.resource('songs');
  this.resource('song-titles');
  this.resource('artists');
  this.resource('artist-names');
  this.resource('artist-songs');
}
