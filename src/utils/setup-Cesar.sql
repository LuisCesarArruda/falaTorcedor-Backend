CREATE DATABASE IF NOT EXISTS falatorcedor;


USE falatorcedor;


CREATE TABLE IF NOT EXISTS time (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    qntdtorcedor INT DEFAULT 0,
    divisao VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS torcedor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS timetorcedor (
    idtime INT NOT NULL,
    idtorcedor INT NOT NULL,
    PRIMARY KEY (idtime, idtorcedor),
    FOREIGN KEY (idtime) REFERENCES time(id),
    FOREIGN KEY (idtorcedor) REFERENCES torcedor(id)
);
