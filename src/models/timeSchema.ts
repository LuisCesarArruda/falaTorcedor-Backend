import { z } from "zod";

export const timeSchema = z.object({
    nome: z.string().min(1, 'É preciso ter o nome'),
    localizacao: z.string().min(1, "é preciso ter a localização"),
});