import { FastifyInstance } from "fastify";
import { createTorcedor, deleteTorcedor, readTorcedores, readTorcedorId, updateTorcedor } from "../controller/torcedorController";

export async function torcedorRoutes(app:FastifyInstance) {
    
    app.post("/torcedor/new", createTorcedor)// Criar um novo torcedor
    app.get("/torcedores", readTorcedores)// Listar todos os torcedor
    app.get("/torcedor/:id", readTorcedorId)// Obter um torcedor específico
    app.put("/torcedor/:id",updateTorcedor)// Atualizar um torcedor
    app.delete("/torcedor/:id", deleteTorcedor)//deletar um torcedor
}