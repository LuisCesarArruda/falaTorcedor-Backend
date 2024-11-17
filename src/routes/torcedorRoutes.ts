import { FastifyInstance } from "fastify";
import { createTorcedor } from "../controller/torcedorController";

export async function torcedorRoutes(app:FastifyInstance) {
    
    app.post("/torcedor", createTorcedor)

}