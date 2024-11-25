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
            'SELECT EXISTS(SELECT 1 FROM "time" WHERE nome = $1)'
            , [nome]
        )
        const timeExists = timeCadastrado.rows[0].exists;
        //se for verdadeiro retorna um error dizendo que ja foi cadastrado
        if (timeExists) {
            return res.status(400).send({ error: 'Já existe um time com esse nome' });
        }

        //inserindo os dados do time no DB
        const result = await db.query(
            'INSERT INTO "time"(nome,localizacao) VALUES ($1, $2) RETURNING id'
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
//obter todos os times
export const readTimes = async (req: FastifyRequest, res: FastifyReply) => {
    try {

        const result = await db.query(
            'SELECT * FROM time'
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "não há times" })
        }

        return res.status(200).send(result.rows)
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Erro ao tentar buscar os times." });
    }
}
// obter um time em expecifico 
export const readTimeId = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id } = timeSchema.parse(req.body)

        const result = await db.query(
            'SELECT * FROM time WHERE  id = $1 ',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "time não encontrado" })
        }

        return res.status(200).send(result.rows[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }

}
//atualizar um time em especifico
export const updateTime = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id, nome, localizacao } = timeSchema.parse(req.body)

        const result = await db.query(
            'UPDATE "time" SET nome = $1, localizacao = $2 WHERE id = $3 RETURNING *',
            [nome, localizacao, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Time não encontrado' });
        }
        return res.status(200).send({ message: "Time atualizado com sucesso" })

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
}

//deletar um time
export const deleteTime = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id } = timeSchema.parse(req.body)

        const result = await db.query(
            'DELETE FROM time WHERE id = $1',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send("Time não encontrado ou ja foi deletado")
        }
        res.send({ message: 'Time deletado com sucesso!' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
}

