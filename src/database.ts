import { knex as setupKnex } from "knex";

const config = {
    client: 'sqlite',
    connection: {
        filename: './../database/database.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './database/migrations'
    }
};

export const knex = setupKnex(config);
export { config };