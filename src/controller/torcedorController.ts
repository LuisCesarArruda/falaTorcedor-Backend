import { z } from 'zod';
import { db } from '../utils/db';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { torcedorSchema } from '../models/torcedorSchema';

export const createTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { nome, email, telefone, time } = torcedorSchema.parse(req.body)

        // verificando se o email foi cadastrado
        const emailCadastrado = await db.query(
            'SELECT EXISTS(SELECT 1 FROM "torcedor" WHERE email = $1)'
            , [email]
        )
        const emailExists = emailCadastrado.rows[0].exists;
        //se for verdadeiro retorna um error dizendo que ja foi cadastrado
        if (emailExists) {
            return res.status(400).send({ error: 'Já existe um torcedor com esse email' });
        }

        //inserindo os dados do torcedor no DB
        const result = await db.query(
            'INSERT INTO "torcedor"(nome,email,telefone) VALUES ($1, $2, $3) RETURNING id'
            , [nome, email, telefone]
        )
        const torcedorID = result.rows[0].id

        // vendo os times passados pelo torcedor na hora do cadastro
        for (const nomeTime of time) {
            const timeResult = await db.query('SELECT id FROM time WHERE nome = $1', [nomeTime]);

            //torcedor so pode cadastrar o time caso exista no banco
            if (timeResult.rows.length === 0) {
                throw new Error(`Time "${nomeTime}" não encontrado`);
            }
            const timeId = timeResult.rows[0].id
            // inserindo a co-relação na tabela junção de timeTorcedor passando o ID dos times para relacionar
            await db.query(
                'INSERT INTO "timeTorcedor"(IDTime, IDTorcedor) VALUES ($1, $2)',
                [timeId, torcedorID]
            )

            //atualizando a quantidade de torcedor no DB
            await db.query(
                'UPDATE time SET qntdtorcedor = qntdtorcedor + 1 WHERE id = $1'
            )

            return res.status(201).send({ message: 'Torcedor cadastrado com sucesso!' })
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
}

//obter todos os torcedores
export const readTorcedores = async (req: FastifyRequest, res: FastifyReply) => {
    try {

        const result = await db.query(
            'SELECT * FROM time'
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "não há torcedor" })
        }

        return res.status(200).send(result.rows)
    } catch (error) {

    }
}

// obter um torcedor em expecifico 
export const readTorcedorId = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id } = torcedorSchema.parse(req.body)

        const result = await db.query(
            'SELECT * FROM torcedor WHERE  id = $1 ',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "torcedor não encontrado" })
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
//atualizar um torcedor em especifico
export const updateTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id, nome, email, telefone, time } = torcedorSchema.parse(req.body)

        const result = await db.query(
            'UPDATE "torcedor" SET nome = $1, email = $2, telefone = $3, time = $4 WHERE id = $5 RETURNING *',
            [nome, email,telefone,time, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'torcedor não encontrado' });
        }
        return res.status(200).send({ message: "torcedor atualizado com sucesso" })

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
export const deleteTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { id } = torcedorSchema.parse(req.body)

        const result = await db.query(
            'DELETE FROM torcedor WHERE id = $1',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send("torcedor não encontrado ou ja foi deletado")
        }
        res.send({ message: 'torcedor deletado com sucesso!' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
}
