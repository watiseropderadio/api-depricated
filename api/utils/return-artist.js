var returnRecord = require('./return-record')

module.exports = function(artist) {

  return returnRecord({
    recordCollection: Artist,
    recordName: artist,
    recordNameCollection: ArtistName,
    recordTitleName: 'name',
    relationName: 'artist'
  })

}
