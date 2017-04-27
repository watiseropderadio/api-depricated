export function up(schema) {
  return schema.createTable('artist_songs', table => {
    table.increments('id');
    table.integer('song_id').index();
    table.integer('artist_id').index();
    table.timestamps();

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('artist_songs');
}
