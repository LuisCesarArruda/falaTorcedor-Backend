import { z } from "zod";

export const torcedorSchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(1, 'É preciso ter o nome'),
    email: z.string().email('Formato de email inválido'),
    telefone: z.string().min(10,"Insira seu telefone"),
    IDtime: z.array(z.number()).optional(),
    time: z.string().min(1, 'É preciso ter o nome do time'),
});
