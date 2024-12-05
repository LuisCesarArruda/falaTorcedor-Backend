import { FastifyInstance } from "fastify";
import {
    createTorcedor,
    deleteTorcedor,
    readTorcedores,
    readTorcedoresByTime,
    readTorcedorId,
    updateTorcedor
} from "../controller/torcedorController";

export async function torcedorRoutes(app: FastifyInstance) {
    // Criar um novo torcedor
    app.post("/torcedor/new", createTorcedor);

    // Listar todos os torcedores
    app.get("/torcedores", readTorcedores);

    // Obter um torcedor específico pelo ID
    app.get("/torcedor/:id", readTorcedorId);

    // Atualizar um torcedor específico pelo ID
    app.put("/torcedor/:id", updateTorcedor);

    // Deletar um torcedor específico pelo ID
    app.delete("/torcedor/:id", deleteTorcedor);

    // Obter todos os torcedores de um time específico
    app.get('/torcedor/time/:time', readTorcedoresByTime);
}
