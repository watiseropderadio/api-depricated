# Routes

## /plays

Example request urls

 * /plays/?radio_id=...
 * /plays/?radio_slug=...


## /songs

Example request urls

 * /songs/:id
 * /songs/?title=...&artist_slug=...


## /radiostations

Example request urls

 * /radiostations
 * /radiostations/?country_code=...


# Schema

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
 - song_id (BelongsTo Song)
 - playlist_items (Has Many plays)

artists
 - slug (String)
 - names (Array)

radiostations
 - name (String)
 - slug (String)
 - country_code (String)
 - stream_urls (Array)
 - website_url (String)
