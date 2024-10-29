import fastify from "fastify";
import knex from "./database";

const app = fastify();

app.get("/", async (request, reply) => {
    const tables = await knex('sqlite_schema').select('*');

    return tables;
});

app.listen({
    port: 3333,
}).then(() => {
    console.log('Daily Diet API is running on port 3333');
});