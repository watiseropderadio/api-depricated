var RSVP = require('rsvp')
var removeDiacritics = require('diacritics').remove
var S = require('string');

module.exports = function(artists, title) {

  return new RSVP.Promise(function(resolve, reject) {

    /* TODO: check for artists in the songs collection */

    Song.native(function(error, collection) {
      if (error) return console.log(error)
      return collection.find({
        titles: {
          '$in': [title]
        }
      }).toArray(function(error, titleResult) {
        if (error) return console.log(error)

        // return console.log(titleResult)

        if (titleResult.length > 0) {
          // return song
          // console.log('returning song', titleResult[0].titles[0])
          return resolve(titleResult[0])
        }

        var titlePlain = removeDiacritics(title)

        Song.native(function(error, collection) {
          if (error) return console.log(error)
          return collection.find({
            titles: {
              '$in': [titlePlain]
            },
            artists: artistIds
          }).toArray(function(error, titlePlainResults) {

            // add title to song with having plain result
            if (titlePlainResults.length > 0) {
              titlePlainResult = titlePlainResults[0]
              console.log('adding title', title)
              titlePlainResult.titles.push(title)
              return titlePlainResult.save(function(error) {
                if (error) return console.log(error)
                return resolve(titlePlainResult)
              });
            }

            // create song
            // console.log('creating song', title)

            // get a song slug
            var slug = S(titlePlain).slugify().s

            return async.forever(
              function(next) {

                // next is suitable for passing to things that need a callback(err [, whatever]);
                // it will result in this function being called again.
                return Song.findOne({
                  slug: slug
                }).exec(function findOneCB(error, titleResult) {

                  if (error) {
                    console.log(error)
                    return false
                  }

                  // if the slug exsist change it and try again
                  if (titleResult) {
                    console.log('findSlug titleResult', titleResult.slug)
                    var parts = slug.split('-')
                    var lastPart = parts[parts.length - 1]
                    if (S(lastPart).isNumeric()) {
                      var newInt = S(lastPart).toInt() + 1
                      var newParts = parts
                      newParts.pop()
                      newParts.push(newInt)
                      slug = newParts.join('-')
                      return next();
                    } else {
                      slug = slug + '-2'
                      return next();
                    }
                  }

                  // add lower case plain title to song for easy lookup
                  var titles = [title];
                  if (title !== titlePlain.toLowerCase()) {
                    titles.push(titlePlain.toLowerCase())
                  }

                  var song = {
                    slug: slug,
                    titles: titles,
                    artists: artists
                  }

                  // create the song with the slug and artists
                  return Song.create(song).exec(function createCB(error, newSong) {
                    if (error) return console.log(error)
                    return resolve(newSong)
                  })
                });
              }
            );
          })
        })
      })
    })
  })
}
