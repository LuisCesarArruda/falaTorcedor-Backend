import fastifyCors from "@fastify/cors";
import fastify from "fastify";

import {torcedorRoutes} from "./routes/torcedorRoutes"
import { timeRoutes } from "./routes/timeRoutes";

export const app = fastify();

app.register(fastifyCors, {
    origin: "*"
})

app.register(torcedorRoutes)
app.register(timeRoutes)


app.listen({port:3333, host: "0.0.0.0"}).then(() => {
    console.log("server funcionando")
})