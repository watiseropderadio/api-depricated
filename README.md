# Watiseropderadio API v1.0.01
**Warning: this project is still a work in progress**

Some people think that *open-source* will kill their business. We don't. We have build this API on top of other *open-source* software like [Node.js](https://nodejs.org), [Express](http://expressjs.com/), [Sails.js](http://sailsjs.org/) and [dokku](http://progrium.viewdocs.io/dokku/).

## Usage
If you want to use this API, please get in contact with us. We have contact options on [watiseropderadio.nl](http://watiseropderadio.nl). There are limits on usage of our API. If you use this API without a valid *API-key* it is not unlikely that you get banned after *x* requests.

## Routes

### /plays

Example request urls

 * `/plays/?radio_id=...`
 * `/plays/?radio_slug=...`


### /songs

Example request urls

 * `/songs/:id`
 * `/songs/?title=...&artist_slug=...`


### /radios

Example request urls

 * `/radios`
 * `/radios/:id`
 * `/radios/?country_code=...`


## Schema
The schema used by *Sails.js* as defined in [api/models/*.js](https://github.com/watiseropderadio/api/tree/master/api/models).

Play
 - `playedAt` *(Datetime)*
 - `radio` *(BelongsTo Radio)*
 - `song` *(BelongsTo Song)*
 - `recording` *(BelongsTo Recording)*

Recording
 - `url` *(String)*
 - `plays` *(Has Many Plays)*

Song
 - `slug` *(String)*
 - `title` *(String)*
 - `titles` *(Has Many SongTitles)*
 - `artists` *(Has Many Artists)*
 - `plays` *(Has Many Plays)*

SongTitle
 - `title` *(String)*
 - `song` *(BelongsTo Song)*

Artist
 - `slug` *(String)*
 - `name` *(String)*
 - `names` *(Has Many ArtistNames)*
 - `songs` *(Has Many Songs)*

ArtistName
 - `title` *(String)*
 - `artist` *(BelongsTo Artist)*

Radio
 - `name` *(String)*
 - `nameShort` *(String)*
 - `slug` *(String)*
 - `countryCode` *(String)*
 - `streamUrl` *(String)*
 - `website` *(String)*
 - `plays` *(Has Many Plays)*
