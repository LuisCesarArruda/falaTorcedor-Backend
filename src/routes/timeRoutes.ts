import { FastifyInstance } from "fastify";
import { createTime, deleteTime, readTimeId, readTimes, updateTime } from "../controller/timeController";


export async function timeRoutes(app: FastifyInstance) {


    app.post("/time", createTime)// Criar um novo time
    app.get("/time", readTimes)// Listar todos os times
    app.get("time/:id", readTimeId)// Obter um time específico
    app.put("/time/:id", updateTime)// Atualizar um time
    app.delete("/time/:id", deleteTime)//deletar um time

}