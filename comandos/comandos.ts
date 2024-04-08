require(`dotenv`).config();

interface Comandos {
    figurinhas: Array<string>;
    grupo: Array<string>;
    info: Array<string>;
    download: Array<string>;
    admin: Array<string>;
    diversao: Array<string>;
    utilidades: Array<string>;
    excecoes_contagem: Array<string>;
}

const PREFIX = process.env.PREFIX || '!';

const comandos: Comandos = {
    figurinhas: [
        `${PREFIX}s`,
        `${PREFIX}sgif`,
        `${PREFIX}ssf`,
        `${PREFIX}tps`,
        `${PREFIX}simg`,
        `${PREFIX}figurinhas`,
        `${PREFIX}salvar`,
        `${PREFIX}atps`,
        `${PREFIX}figurinhas+18`,
        `${PREFIX}salvar+18`,
    ],
    grupo: [
        `${PREFIX}add`,
        `${PREFIX}regras`,
        `${PREFIX}ban`,
        `${PREFIX}fotogrupo`,
        `${PREFIX}bv`,
        `${PREFIX}autosticker`,
        `${PREFIX}link`,
        `${PREFIX}rlink`,
        `${PREFIX}mm`,
        `${PREFIX}mt`,
        `${PREFIX}promover`,
        `${PREFIX}rebaixar`,
        `${PREFIX}status`,
        `${PREFIX}apg`,
        `${PREFIX}f`,
        `${PREFIX}afake`,
        `${PREFIX}mutar`,
        `${PREFIX}alink`,
        `${PREFIX}blista`,
        `${PREFIX}dlista`,
        `${PREFIX}listanegra`,
        `${PREFIX}aporno`,
        `${PREFIX}contador`,
        `${PREFIX}topativos`,
        `${PREFIX}hidetag`,
    ],
    info: [`${PREFIX}menu`],
    download: [`${PREFIX}play`, `${PREFIX}ig`, `${PREFIX}fb`, `${PREFIX}img`, `${PREFIX}yt`],
    admin: [
        `${PREFIX}admin`,
        `${PREFIX}sair`,
        `${PREFIX}pvliberado`,
        `${PREFIX}bcmdglobal`,
        `${PREFIX}dcmdglobal`,
        `${PREFIX}sairgrupos`,
        `${PREFIX}infocompleta`,
        `${PREFIX}entrargrupo`,
        `${PREFIX}mtodos`,
        `${PREFIX}mcontatos`,
        `${PREFIX}mgrupos`,
        `${PREFIX}print`,
        `${PREFIX}fotobot`,
        `${PREFIX}limpartudo`,
        `${PREFIX}autostickerpv`,
        `${PREFIX}limpar`,
        `${PREFIX}bloquear`,
        `${PREFIX}usuarios`,
        `${PREFIX}limpartipo`,
        `${PREFIX}limitediario`,
        `${PREFIX}taxalimite`,
        `${PREFIX}limitarmsgs`,
        `${PREFIX}desbloquear`,
        `${PREFIX}estado`,
        `${PREFIX}rconfig`,
        `${PREFIX}mudarlimite`,
        `${PREFIX}alterartipo`,
        `${PREFIX}grupos`,
        `${PREFIX}tipos`,
        `${PREFIX}rtodos`,
        `${PREFIX}r`,
        `${PREFIX}verdados`,
        `${PREFIX}desligar`,
        `${PREFIX}listablock`,
    ],
    diversao: [`${PREFIX}viadometro`, `${PREFIX}bafometro`, `${PREFIX}gadometro`],
    utilidades: [`${PREFIX}voz`, `${PREFIX}pesquisa`, `${PREFIX}noticias`],
    excecoes_contagem: [
        `${PREFIX}meusdados`,
        `${PREFIX}ajuda`,
        `${PREFIX}help`,
        `${PREFIX}menu`,
        `${PREFIX}help`,
        `${PREFIX}menu`,
        `${PREFIX}info`,
        `${PREFIX}reportar`,
    ],
};

export default comandos;
