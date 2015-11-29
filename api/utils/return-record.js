var RSVP = require('rsvp')
var async = require('async')
var removeDiacritics = require('diacritics').remove
var S = require('string');

module.exports = function(recordOptions) {

  return new RSVP.Promise(function(resolve, reject) {

    var recordCollection = recordOptions.recordCollection
    var recordNameTrimmed = S(recordOptions.recordName).trim().s
    var recordNameCollection = recordOptions.recordNameCollection
    var recordTitleName = recordOptions.recordTitleName
    var relationName = recordOptions.relationName
    var whereArtists = recordOptions.whereArtists
    var artistIds = []

    if (whereArtists) {
      for (var i = whereArtists.length - 1; i >= 0; i--) {
        artistIds.push(whereArtists[i].id)
      }
    }

    async.waterfall([

        function findRecordByName(callback) {
          var nameOptions = {}
          nameOptions[recordTitleName] = recordNameTrimmed
          recordNameCollection.find(nameOptions).exec(function findRecordByName(error, recordNames) {
            if (error) return callback(error)

            // Do this for finding the song because we have artists ids here
            if (whereArtists && recordNames.length > 0) {
              // Loop over results to check if
              for (var i = recordNames.length - 1; i >= 0; i--) {
                var recordId = recordNames[i][relationName]
                recordCollection.find({
                  id: recordId
                }).populate('artists', {
                  id: artistIds
                }).exec(function findRecordAndPopulate(error, found) {
                  if (error) return callback(error)
                  if (found.length === 0) return callback(null, null)

                  var promises = found.map(function(song) {
                    return new RSVP.Promise(function(resolve) {
                      if (song.artists.length === artistIds.length) {
                        return resolve(song)
                      }
                      return resolve()
                    })
                  })

                  RSVP.all(promises).then(function(songs) {
                    // posts contains an array of results for the given promises
                    var match = null
                    for (var i = songs.length - 1; i >= 0; i--) {
                      if (songs[i]) {
                        match = songs[i]
                      }
                    }
                    if (match) return callback(null, match)
                    return callback(null, null)
                    console.log('RSVP artists', artists)
                  }).catch(function(reason) {
                    return callback(reason)
                  })
                })
              }
            } else if (recordNames.length > 0) {
              recordCollection.findOne({
                id: recordNames[0][relationName] // Eg. id: artistName['artist']
              }).exec(function findOneRecordById(error, record) {
                if (error) return callback(error)
                if (record) return callback(null, record)
                return callback(null, null)
              })
            } else {
              return callback(null, null)
            }
          })
        },
        function createRecord(record, callback) {
          // Only create record when there is no record yet
          if (record) return callback(null, record)

          // Create a slug for the record
          var recordNamePlain = removeDiacritics(recordNameTrimmed)
          var recordSlug = S(recordNamePlain).slugify().s
          var slug = recordSlug
          var findSlug = true
          var newRecord = null

          async.whilst(
            function() {
              return findSlug
            },
            function(whilstCallback) {

              return recordCollection.findOne({
                slug: slug
              }).exec(function findRecordBySlug(error, recordResult) {

                if (error) return whilstCallback(error)

                // If the slug exsist change it and try again
                if (recordResult) {
                  var parts = slug.split('-')
                  var lastPart = parts[parts.length - 1]
                  if (lastPart && S(lastPart).isNumeric()) {
                    var newInt = S(lastPart).toInt() + 1
                    var newParts = parts
                    newParts.pop()
                    newParts.push(newInt)
                    slug = newParts.join('-')
                    return whilstCallback(null, null);
                  } else {
                    slug = slug + '-2'
                    return whilstCallback(null, null);
                  }
                }

                // Create the record with the slug
                var newRecordOptions = {}
                newRecordOptions.slug = slug
                newRecordOptions[recordTitleName] = recordNameTrimmed
                return recordCollection.create(newRecordOptions).exec(function createNewRecord(error, newDatabaseRecord) {
                  if (error) return whilstCallback(error)

                  // Only do this with songs (whereArtists)
                  if (whereArtists && artistIds) {
                    newDatabaseRecord.artists.add(artistIds)
                    newDatabaseRecord.save(function(error) {
                      // TODO: Whould be good to have some better error handling here
                      if (error) return whilstCallback(error)
                    })
                  }

                  newRecord = newDatabaseRecord

                  // Set options and reuse the newRecord value
                  var options = {}
                  options[recordTitleName] = recordNameTrimmed
                  options[relationName] = newRecord

                  // create the original record name
                  return recordNameCollection.create(options).exec(function createNewRecordName(error, firstArtistName) {
                    if (error) return whilstCallback(error)

                    // Do not create the plain name if it is the same
                    if (recordNameTrimmed === recordNamePlain) {
                      findSlug = false
                      return whilstCallback(null, newRecord)
                    }

                    // Create the plain record name
                    options[recordTitleName] = recordNamePlain
                    return recordNameCollection.create(options).exec(function createNewRecordPlainName(error, secondArtistName) {

                      if (error) return whilstCallback(error)
                      findSlug = false
                      return whilstCallback(null, newRecord)
                    })
                  })
                })
              })

            },
            function(error) {
              if (error) return callback(error)
              return callback(null, newRecord)
            }
          );
        }
      ],
      function waterfallDone(error, record) {
        if (error) {
          console.error(error)
          return reject(error)
        }
        return resolve(record)
      })
  })
}
