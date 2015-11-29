var returnRecord = require('./return-record')

module.exports = function(artists, title) {

  return returnRecord({
    recordCollection: Song,
    recordName: title,
    whereArtists: artists,
    recordNameCollection: SongTitle,
    recordTitleName: 'title',
    relationName: 'song'
  })

}
