Tree:
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
  - lux g resource play song:belongs-to playedAt:date exact:boolean
  - lux g resource song play:has-many slug:string title:string
