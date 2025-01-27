import { z } from 'zod';
import { db } from '../utils/db';
import { FastifyReply, FastifyRequest } from 'fastify';


import { torcedorSchema } from '../models/torcedorSchema';


const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
export const createTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { nome, email, telefone, time } = torcedorSchema.parse(req.body);

        const nometimeMinusculo = removeAccents(time).toLowerCase();

        const emailCadastrado = await db.query(
            'SELECT EXISTS(SELECT 1 FROM "torcedor" WHERE email = $1)',
            [email]
        );
        const emailExists = emailCadastrado.rows[0].exists;

        if (emailExists) {
            return res.status(400).send({ error: 'Já existe um torcedor com esse email' });
        }

        await db.query('BEGIN');

        const result = await db.query(
            'INSERT INTO "torcedor"(nome, email, telefone) VALUES ($1, $2, $3) RETURNING id',
            [nome, email, telefone]
        );
        const torcedorID = result.rows[0].id;

        const timeResult = await db.query('SELECT id FROM time WHERE nome = $1', [nometimeMinusculo]);

        if (timeResult.rows.length === 0) {
            throw new Error(`Time "${nometimeMinusculo}" não encontrado`);
        }
        const timeId = timeResult.rows[0].id;

        await db.query(
            'INSERT INTO "timetorcedor"(IDTime, IDTorcedor) VALUES ($1, $2)',
            [timeId, torcedorID]
        );

        await db.query(
            'UPDATE time SET qntdtorcedor = qntdtorcedor + 1 WHERE id = $1',
            [timeId]
        );
        await db.query('COMMIT');

        return res.status(201).send({ message: 'Torcedor cadastrado com sucesso!' });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Erro ao processar requisição:", error);
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            res.status(500).send({ error: "Erro no servidor" });
        }
    }
};

// Obter torcedores por time
export const readTorcedoresByTime = async (req: FastifyRequest, res: FastifyReply) => {
    const torcedorParamsSchema = z.object({
        time: z.string()
    });

    try {
        const { time } = torcedorParamsSchema.parse(req.params);

        const nometimeMinusculo = removeAccents(time).toLowerCase();

        const timeResult = await db.query(
            'SELECT id FROM time WHERE nome = $1',
            [nometimeMinusculo]
        );

        if (timeResult.rows.length === 0) {
            return res.status(404).send({ error: `Time "${time}" não encontrado` });
        }

        const timeId = timeResult.rows[0].id;

        const result = await db.query(
            'SELECT torcedor.id, torcedor.nome FROM torcedor ' +
            'JOIN timetorcedor ON torcedor.id = timetorcedor.IDTorcedor ' +
            'WHERE timetorcedor.IDTime = $1',
            [timeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({ error: `Nenhum torcedor encontrado para o time "${time}"` });
        }

        return res.status(200).send(result.rows);
    } catch (error) {
        console.error('Erro ao obter torcedores de time:', error);
        res.status(500).send({ error: 'Erro no servidor' });
    }
};

// Obter todos os torcedores
export const readTorcedores = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const result = await db.query('SELECT * FROM torcedor');

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "não há torcedor" });
        }

        return res.status(200).send(result.rows);
    } catch (error) {
        console.error('Erro ao obter torcedores:', error);
        res.status(500).send({ error: 'Erro no servidor' });
    }
};

// Obter um torcedor específico
export const readTorcedorId = async (req: FastifyRequest, res: FastifyReply) => {
    const idSchema = z.object({
        id: z.string().transform((val) => parseInt(val, 10)), // Converte a string para um número inteiro
    });
    try {

        const { id } = idSchema.parse(req.params);


        // Fazendo a consulta no banco de dados
        const result = await db.query(
            'SELECT id, nome, email, telefone FROM torcedor WHERE id = $1',
            [id]
        );

        // Verificando se o torcedor foi encontrado
        if (result.rows.length === 0) {
            return res.status(404).send({ error: "Torcedor não encontrado" });
        }

        // Retorna o torcedor encontrado
        return res.status(200).send(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Erro de validação do Zod
            console.error("Erro de validação:", error.errors);
            return res.status(400).send({ error: "ID inválido", details: error.errors });
        }
        console.error("Erro no servidor:", error);
        return res.status(500).send({ error: "Erro no servidor" });
    }
};

// Atualizar um torcedor específico
export const updateTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    const torcedorParamsSchema = z.object({
        id: z.string().transform(Number),
    });
    try {
        const { id } = torcedorParamsSchema.parse(req.params);
        const { nome, email, telefone } = torcedorSchema.pick({ nome: true, email: true, telefone: true }).parse(req.body);

        const result = await db.query(
            'UPDATE "torcedor" SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, email, telefone, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Torcedor não encontrado' });
        }
        return res.status(200).send({ message: "Torcedor atualizado com sucesso", torcedor: result.rows[0] });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
};

// Deletar um torcedor
export const deleteTorcedor = async (req: FastifyRequest, res: FastifyReply) => {
    const torcedorParamsSchema = z.object({
        id: z.string().transform(Number),
    });
    try {
        const { id } = torcedorParamsSchema.parse(req.params); // Recebendo o ID do torcedor pela URL

        // Inicia uma transação
        await db.query('BEGIN');

        // Obtém o ID do time associado ao torcedor
        const result = await db.query(
            'SELECT timetorcedor.IDTime FROM timetorcedor WHERE timetorcedor.IDTorcedor = $1',
            [id]
        );

        if (result.rows.length === 0) {
            // Caso o torcedor não esteja associado a nenhum time
            return res.status(404).send("Torcedor não encontrado ou não associado a nenhum time.");
        }

        const timeId = result.rows[0].IDTime;

        // Exclui o torcedor da tabela torcedor
        await db.query('DELETE FROM torcedor WHERE id = $1', [id]);

        // Atualiza a quantidade de torcedores do time (decrementa 1)
        await db.query(
            'UPDATE time SET qntdtorcedor = qntdtorcedor - 1 WHERE id = $1',
            [timeId]
        );

        // Confirma a transação
        await db.query('COMMIT');

        res.send({ message: 'Torcedor deletado com sucesso e quantidade atualizada!' });

    } catch (error) {
        // Caso ocorra algum erro, desfaz as operações
        await db.query('ROLLBACK');

        if (error instanceof z.ZodError) {
            res.status(400).send({ error: error.errors });
        } else {
            console.error('Erro no servidor:', error);
            res.status(500).send({ error: 'Erro no servidor' });
        }
    }
};
