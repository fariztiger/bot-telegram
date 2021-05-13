exports.up = async function (knex) {
    await knex.schema.dropTableIfExists('members')
    await knex.schema.createTable('members', function (table) {
      table.increments('id')
      table.integer('id_telegram').notNullable().unique()
      table.string('username_telegram')
      table.string('first_name')
      table.string('last_name')
      table.string('id_twitter')
      table.string('username_twitter').unique()
      table.string('wallet_address', 200)
      table.integer('step_input', 2).defaultTo(0).comment('step 1. inserting user twiiter, 2. input adress');
      table.boolean('is_done').defaultTo(0);
      table.string('ref');
      table.string('captcha', 10);
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  }
  exports.down = function (knex) {
    return knex.schema.dropTable('members')
  }