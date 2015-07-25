var RSVP = require('rsvp')
var removeDiacritics = require('diacritics').remove
var S = require('string');

module.exports = function(artist) {

  return new RSVP.Promise(function(resolve, reject) {

    artist = S(artist).trim().s

    Artist.native(function(error, collection) {
      if (error) return console.log(error)
      return collection.find({
        names: {
          '$in': [artist]
        }
      }).toArray(function(error, artistResult) {
        if (error) return console.log(error)

        if (artistResult.length > 0) {
          return resolve(artistResult[0])
        }

        var artistPlain = removeDiacritics(artist)
        return Artist.findOne({
          'names': new RegExp(artistPlain)
        }).exec(function findOneCB(error, artistPlainResult) {

          // add name to artist with having plain result
          if (artistPlainResult) {
            console.log('adding artist name', artist)
            artistPlainResult.names.push(artist)
            return artistPlainResult.save(function(error) {
              if (error) return console.log(error)
              return resolve(artistPlainResult)
            });
          }

          // create artist
          console.log('creating artist', artist)

          // get a artists slug
          var slug = S(artistPlain).slugify().s

          return async.forever(
            function(next) {

              // next is suitable for passing to things that need a callback(err [, whatever]);
              // it will result in this function being called again.
              return Artist.findOne({
                slug: slug
              }).exec(function findOneCB(error, artistResult) {

                if (error) {
                  console.log(error)
                  return false
                }

                // if the slug exsist change it and try again
                if (artistResult) {
                  console.log('findSlug artistResult', artistResult.slug)
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

                // add lower case plain name to artist for easy lookup
                var names = [artist];
                if (artist !== artistPlain.toLowerCase()) {
                  names.push(artistPlain.toLowerCase())
                }

                // create the artist with the slug
                return Artist.create({
                  slug: slug,
                  names: names
                }).exec(function createCB(error, newArtist) {
                  if (error) return console.log(error)
                  return resolve(newArtist)
                })
              });
            }
          );
        })
      })
    })
  })
}
