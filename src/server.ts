import fastifyCors from "@fastify/cors";
import fastify from "fastify";

import { torcedorRoutes } from "./routes/torcedorRoutes"
import { timeRoutes } from "./routes/timeRoutes";

export const app = fastify();

app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

app.register(torcedorRoutes)
app.register(timeRoutes)


app.listen({ port: 8888 }).then(() => {
    console.log("server funcionando")
})