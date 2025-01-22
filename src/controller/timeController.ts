import { z } from 'zod';
import { db } from '../utils/db';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { timeSchema } from '../models/timeSchema';

const removeAccents = (str: String) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const createTime = async (req: FastifyRequest, res: FastifyReply) => {

    try {
        const { nome, localizacao, serie } = timeSchema.parse(req.body)
        const nometimeMinusculo = removeAccents(nome).toLowerCase();
        const localizacaoNormalizado = removeAccents(localizacao).toLowerCase();

        const timeCadastrado = await db.query(
            'SELECT EXISTS(SELECT 1 FROM "time" WHERE nome = $1)'
            , [nometimeMinusculo]
        )
        const timeExists = timeCadastrado.rows[0].exists;
        if (timeExists) {
            return res.status(400).send({ error: 'Já existe um time com esse nome' });
        }

        const result = await db.query(
            'INSERT INTO "time"(nome,localizacao, serie) VALUES ($1, $2,$3) RETURNING id'
            , [nometimeMinusculo, localizacaoNormalizado, serie]
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

export const readTimeId = async (req: FastifyRequest, res: FastifyReply) => {
    const timeParamsSchema = z.object({
        id: z.string().transform((val) => parseInt(val, 10)), 
    });
    try {
        
        const { id } = timeParamsSchema.parse(req.params);  

        
        const result = await db.query(
            'SELECT * FROM time WHERE id = $1',
            [id]
        );

        
        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Time não encontrado' });
        }

        return res.status(200).send(result.rows[0]);

    } catch (error) {

        if (error instanceof z.ZodError) {
            return res.status(400).send({ error: error.errors });
        } else {

            console.error('Erro no servidor:', error);
            return res.status(500).send({ error: 'Erro no servidor' });
        }
    }
};

export const updateTime = async (req: FastifyRequest, res: FastifyReply) => {
    const timeParamsSchema = z.object({
        id: z.string().transform(Number),
    });
    try {
        const { id } = timeParamsSchema.parse(req.params);
        const {nome, localizacao,serie } = timeSchema.parse(req.body)

        const nometimeMinusculo = removeAccents(nome).toLowerCase();
        const localizacaoNormalizado = removeAccents(localizacao).toLowerCase();

        const result = await db.query(
            'UPDATE "time" SET nome = $1, localizacao = $2 serie =$3 WHERE id = $4 RETURNING *',
            [nometimeMinusculo, localizacaoNormalizado, serie, id]
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

export const deleteTime = async (req: FastifyRequest, res: FastifyReply) => {
    const timeParamsSchema = z.object({
        id: z.string().transform(Number),
    });
    try {
        const { id } = timeParamsSchema.parse(req.params); 
        
        // Deleta as associações na tabela timetorcedor
        await db.query(
            'DELETE FROM timetorcedor WHERE idtime = $1',
            [id]
        );

        // Deleta os torcedores associados ao time
        await db.query(
            'DELETE FROM torcedor WHERE id IN (SELECT idtorcedor FROM timetorcedor WHERE idtime = $1)',
            [id]
        );

        // Deleta o time
        const result = await db.query(
            'DELETE FROM time WHERE id = $1 RETURNING *',
            [id]
        );

        // Verificar se o time foi realmente deletado
        if (result.rows.length === 0) {
            return res.status(404).send("Time não encontrado ou já foi deletado");
        }

        res.send({ message: 'Time deletado com sucesso!' });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).send({ error: 'Erro no servidor' });
    }
};



