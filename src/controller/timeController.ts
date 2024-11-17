import { z } from 'zod';
import { db } from '../utils/db';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { timeSchema } from '../models/timeSchema';

export const createTime = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { nome, localizacao } = timeSchema.parse(req.body)

        // verificando se o time ja foi cadastrado
        const timeCadastrado = await db.query(
            'SELECT EXISTS(SELECT 1 FROM "time" WHERE email = $1)'
            , [nome]
        )
        const timeExists = timeCadastrado.rows[0].exists;
        //se for verdadeiro retorna um error dizendo que ja foi cadastrado
        if (timeExists) {
            return res.status(400).send({ error: 'Já existe um time com esse nome' });
        }

        //inserindo os dados do time no DB
        const result = await db.query(
            'INSERT INTO "time"(nome,localizacao,qntdtorcedor) VALUES ($1, $2, $3) RETURNING id'
            , [nome, localizacao]
        )

        return res.status(201).send({ message: 'Torcedor cadastrado com sucesso!' })

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
}

