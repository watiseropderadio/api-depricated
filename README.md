# Watiseropderadio API
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

plays
 - datetime (Date)
 - radio_id (BelongsTo Radio)
 - song_id (BelongsTo Song)
 - recording_id (BelongsTo Recording)

recordings
 - audio_url (String)

songs
 - titles (Array)
 - artist_ids (Has Many Artists)
 - playlist_items (Has Many plays)

artists
 - slug (String)
 - names (Array)

radios
 - name (String)
 - slug (String)
 - country_code (String)
 - stream_urls (Array)
 - website_url (String)
