Tree A:
  - play
     - song
       - artist
         - artistName
       - songTitle
  - recording

Tree B:
  - play
     - song
       - artist
         - artistName
       - songTitle
  - recording

Relationships:
  - play hasOne song
  - song hasMany plays
  - song hasMany songTitles
  - song hasMany artists
  - artist hasMany songs
  - artist hasMany artistNames

Generators:
lux g resource play song:belongs-to playedAt:date exact:boolean
lux g resource song play:has-many slug:string title:string song-title:has-many artist-song:has-many
lux g resource song-title title:string song:belongs-to
lux g resource artist-song song:belongs-to artist:belongs-to
lux g resource artist artist-song:has-many artist-name:has-many
lux g resource artist-name name:string artist:belongs-to
