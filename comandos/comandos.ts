require(`dotenv`).config();

interface Comandos {
    figurinhas: string[];
    grupo: string[];
    info: string[];
    download: string[];
    admin: string[];
    diversao: string[];
    utilidades: string[];
}

const comandos: Comandos = {
    figurinhas: [
        `${process.env.PREFIX}s`,
        `${process.env.PREFIX}sgif`,
        `${process.env.PREFIX}ssf`,
        `${process.env.PREFIX}tps`,
        `${process.env.PREFIX}simg`,
        `${process.env.PREFIX}figurinhas`,
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
        `${process.env.PREFIX}alink`,
    ],
    info: [`${process.env.PREFIX}menu`],
    download: [
        `${process.env.PREFIX}play`,
        `${process.env.PREFIX}ig`,
        `${process.env.PREFIX}fb`,
        `${process.env.PREFIX}img`,
        `${process.env.PREFIX}yt`,
    ],
    admin: [
        `${process.env.PREFIX}admin`,
        `${process.env.PREFIX}sair`,
        `${process.env.PREFIX}pvliberado`,
        `${process.env.PREFIX}bcmdglobal`,
        `${process.env.PREFIX}dcmdglobal`,
        `${process.env.PREFIX}sairgrupos`,
        `${process.env.PREFIX}infocompleta`,
        `${process.env.PREFIX}entrargrupo`,
        `${process.env.PREFIX}bctodos`,
        `${process.env.PREFIX}bccontatos`,
        `${process.env.PREFIX}bcgrupos`,
        `${process.env.PREFIX}print`,
        `${process.env.PREFIX}fotobot`,
        `${process.env.PREFIX}limpartudo`,
        `${process.env.PREFIX}autostickerpv`,
        `${process.env.PREFIX}limpar`,
        `${process.env.PREFIX}listablock`,
        `${process.env.PREFIX}bloquear`,
        `${process.env.PREFIX}usuarios`,
        `${process.env.PREFIX}limpartipo`,
        `${process.env.PREFIX}limitediario`,
        `${process.env.PREFIX}taxalimite`,
        `${process.env.PREFIX}limitarmsgs`,
        `${process.env.PREFIX}desbloquear`,
        `${process.env.PREFIX}estado`,
        `${process.env.PREFIX}admin`,
        `${process.env.PREFIX}rconfig`,
        `${process.env.PREFIX}mudarlimite`,
        `${process.env.PREFIX}alterartipo`,
        `${process.env.PREFIX}grupos`,
        `${process.env.PREFIX}tipos`,
        `${process.env.PREFIX}rtodos`,
        `${process.env.PREFIX}r`,
        `${process.env.PREFIX}verdados`,
        `${process.env.PREFIX}desligar`,
    ],
    diversao: [`${process.env.PREFIX}viadometro`, `${process.env.PREFIX}bafometro`, `${process.env.PREFIX}gadometro`],
    utilidades: [`${process.env.PREFIX}voz`, `${process.env.PREFIX}pesquisa`, `${process.env.PREFIX}noticias`],
};

export default comandos;
