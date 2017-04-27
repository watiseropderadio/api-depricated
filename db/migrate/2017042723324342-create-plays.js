export function up(schema) {
  return schema.createTable('plays', table => {
    table.increments('id');
    table.integer('song_id').index();
    table.date('played_at');
    table.boolean('exact');
    table.timestamps();

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('plays');
}
