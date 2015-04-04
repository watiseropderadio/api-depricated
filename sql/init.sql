-- function for auto update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- add table timeline_items
CREATE TABLE timeline_items (
  id BIGSERIAL PRIMARY key,
  on_air TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  radio_id INT NOT NULL,
  song_id INT NULL,
  recording_id INT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on timeline_items
CREATE TRIGGER update_timeline_items_updated_at BEFORE UPDATE
ON timeline_items FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table songs
CREATE TABLE songs (
  id BIGSERIAL PRIMARY key,
  default_title_id INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on songs
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE
ON songs FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table song_titles
CREATE TABLE song_titles (
  id BIGSERIAL PRIMARY key,
  song_id INT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on song_titles
CREATE TRIGGER update_song_titles_updated_at BEFORE UPDATE
ON song_titles FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table artists
CREATE TABLE artists (
  id BIGSERIAL PRIMARY key,
  default_name_id INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on artists
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE
ON artists FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table artist_names
CREATE TABLE artist_names (
  id BIGSERIAL PRIMARY key,
  artist_id INT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on artist_names
CREATE TRIGGER update_artist_names_updated_at BEFORE UPDATE
ON artist_names FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table artists_songs
CREATE TABLE artists_songs (
  id BIGSERIAL PRIMARY key,
  artist_id INT NOT NULL,
  song_id INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on artists_songs
CREATE TRIGGER update_artists_songs_updated_at BEFORE UPDATE
ON artists_songs FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

-- add table recordings
CREATE TABLE recordings (
  id BIGSERIAL PRIMARY key,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- place trigger on recordings
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE
ON recordings FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();
