import { table } from "console";
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table: Knex.TableBuilder) => {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable().references('users.id');
        table.text('name');
        table.text('description');
        table.text('datetime');
        table.boolean('in_diet').defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}
