require('dotenv').config();

interface Comandos {
    figurinhas: string[];
    grupo: string[];
    info: string[];
    download: string[];
}

const comandos: Comandos = {
    figurinhas: [
        `${process.env.PREFIX}s`,
        `${process.env.PREFIX}sgif`,
        `${process.env.PREFIX}ssf`,
        `${process.env.PREFIX}tps`,
        `${process.env.PREFIX}simg`,
    ],
    grupo: [
        `${process.env.PREFIX}add`,
        `${process.env.PREFIX}regras`,
        `${process.env.PREFIX}ban`,
        `${process.env.PREFIX}fotogrupo`,
        `${process.env.PREFIX}bv`,
        `${process.env.PREFIX}autosticker`,
        `${process.env.PREFIX}link`,
        `${process.env.PREFIX}rlink`,
        `${process.env.PREFIX}mm`,
        `${process.env.PREFIX}mt`,
        `${process.env.PREFIX}promover`,
        `${process.env.PREFIX}rebaixar`,
        `${process.env.PREFIX}status`,
        `${process.env.PREFIX}apg`,
        `${process.env.PREFIX}f`,
        `${process.env.PREFIX}afake`,
        `${process.env.PREFIX}mutar`,
    ],
    info: [`${process.env.PREFIX}menu`],
    download: [
        `${process.env.PREFIX}play`,
        `${process.env.PREFIX}ig`,
        `${process.env.PREFIX}fb`,
        `${process.env.PREFIX}img`,
        `${process.env.PREFIX}yt`,
    ],
};

export default comandos;
