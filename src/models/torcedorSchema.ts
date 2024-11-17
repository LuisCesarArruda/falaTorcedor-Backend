import { z } from "zod";

export const torcedorSchema = z.object({
    nome: z.string().min(1, 'É preciso ter o nome'),
    email: z.string().email('Formato de email inválido'),
    telefone: z.string().min(10),
    IDtime: z.array(z.number().int()),
    time: z.string().min(1, 'É preciso ter o nome do time'),
});