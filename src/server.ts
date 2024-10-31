import app from "./app";
import { env } from "./env";

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('Daily Diet API is running on port 3333');
});