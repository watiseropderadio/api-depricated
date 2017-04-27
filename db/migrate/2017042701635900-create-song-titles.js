export function up(schema) {
  return schema.createTable('song_titles', table => {
    table.increments('id');
    table.string('title');
    table.integer('song_id').index();
    table.timestamps();

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('song_titles');
}
