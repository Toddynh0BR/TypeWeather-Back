exports.up = async function(knex) {
  await knex.schema.createTable("tokens", function(table) {
    table.increments('id');
    table.string('cidade');
    table.string('token').notNullable();
    table.boolean('recebe').defaultTo(true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('tokens');
};
