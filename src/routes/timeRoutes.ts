import { FastifyInstance } from "fastify";
import { createTime } from "../controller/timeController";


export async function timeRoutes(app:FastifyInstance) {
    
    app.post("/time", createTime)

}