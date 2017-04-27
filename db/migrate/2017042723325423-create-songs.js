export function up(schema) {
  return schema.createTable('songs', table => {
    table.increments('id');
    table.string('slug');
    table.string('title');
    table.timestamps();

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('songs');
}
