import fastifyCors from "@fastify/cors";
import fastify from "fastify";

import { torcedorRoutes } from "./routes/torcedorRoutes"
import { timeRoutes } from "./routes/timeRoutes";

export const app = fastify(({
    logger: {
        transport: {
            target: "pino-pretty", // Usa o pino-pretty para formatar logs
            options: {
                colorize: true,        // Adiciona cores ao log (útil para terminais)
                translateTime: "HH:MM:ss", // Formata a data/hora
                ignore: "pid,hostname", // Remove campos desnecessários como PID e hostname
                singleLine: true,      // Mantém o log em uma única linha (opcional)
            },
        },
    },
}));


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