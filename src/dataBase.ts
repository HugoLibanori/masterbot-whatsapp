import { AsyncNedb } from 'nedb-async';
import { MessageTypes } from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import { format } from 'date-fns';

const agora = new Date();
const formatoDesejado = 'dd/MM HH:mm:ss';
const dataFormatada = format(agora, formatoDesejado);

const db: any = {};
db.usuarios = new AsyncNedb({ filename: './database/db/usuarios.db', autoload: true });
db.grupos = new AsyncNedb({ filename: './database/db/grupos.db', autoload: true });
db.contador = new AsyncNedb({ filename: './database/db/contador.db', autoload: true });

interface Usuario {
    id_usuario: string;
    nome: string;
    comandos_total: number;
    comandos_dia: number | string;
    max_comandos_dia: number | null;
    tipo: string;
}

interface Grupo {
    id_grupo: string;
    participantes: string[];
    mutar: boolean;
    bemvindo: { status: boolean; msg: string };
    antifake: { status: boolean; ddi_liberados: string[] };
    antilink: { status: boolean; filtros: { youtube: boolean; whatsapp: boolean; facebook: boolean; instagram: boolean } };
    antitrava: { status: boolean; max_caracteres: number };
    antiflood: { status: boolean; max?: number; intervalo?: number };
    antiporno: boolean;
    autosticker: boolean;
    voteban: { status: boolean; max: number; usuario: string; votos: number; votou: string[] };
    contador: { status: boolean; inicio: string };
    enquete: { status: boolean; pergunta: string; opcoes: { opcao: string; digito: number; qtd_votos: number; votos: string[] }[] };
    block_cmds: string[];
    lista_negra: string[];
}

interface Contador {
    id_grupo: string;
    id_usuario: string;
    id_unico: string;
    msg: number;
    imagem: number;
    gravacao: number;
    audio: number;
    sticker: number;
    video: number;
    outro: number;
    texto: number;
}

export default {
    obterUsuario: async (id_usuario: string): Promise<Usuario> => {
        const usuario: Usuario = await db.usuarios.asyncFindOne({ id_usuario });
        return usuario;
    },

    grupoInfoAntiFlood: async (id_grupo: string): Promise<Grupo | undefined> => {
        const antifloodJson: Grupo[] = JSON.parse(fs.readFileSync(path.resolve('database/json/antiflood.json'), { encoding: 'utf-8' }));

        const grupoIndex = antifloodJson.findIndex(item => item.id_grupo === id_grupo);
        return grupoIndex !== -1 ? antifloodJson[grupoIndex] : undefined;
    },

    obterUsuariosTipo: async (tipo: string): Promise<Usuario[]> => {
        const usuarios: Usuario[] = await db.usuarios.asyncFind({ tipo });
        return usuarios;
    },

    verificarRegistro: async (id_usuario: string): Promise<boolean> => {
        const resp = await db.usuarios.asyncFindOne({ id_usuario });
        return resp != null;
    },

    atualizarNome: async (id_usuario: string, nome: string): Promise<void> => {
        await db.usuarios.asyncUpdate({ id_usuario }, { $set: { nome } });
    },

    registrarUsuario: async (id_usuario: string, nome: string): Promise<void> => {
        const { limite_diario } = JSON.parse(fs.readFileSync(path.resolve('database/json/bot.json'), { encoding: 'utf-8' }));

        const cadastro_usuario: Usuario = {
            id_usuario,
            nome,
            comandos_total: 0,
            comandos_dia: 0,
            max_comandos_dia: limite_diario.limite_tipos.bronze,
            tipo: 'bronze',
        };

        await db.usuarios.asyncInsert(cadastro_usuario);
    },

    registrarDono: async (id_usuario: string, nome: string): Promise<void> => {
        const cadastro_usuario_dono: Usuario = {
            id_usuario,
            nome,
            comandos_total: 0,
            comandos_dia: 0,
            max_comandos_dia: null,
            tipo: 'dono',
        };

        await db.usuarios.asyncInsert(cadastro_usuario_dono);
    },

    verificarDonoAtual: async (id_usuario: string): Promise<void> => {
        const { limite_diario } = JSON.parse(fs.readFileSync(path.resolve('database/json/bot.json'), { encoding: 'utf-8' }));

        const usuario = await db.usuarios.asyncFindOne({ id_usuario, tipo: 'dono' });

        if (!usuario) {
            await db.usuarios.asyncUpdate(
                { tipo: 'dono' },
                { $set: { tipo: 'bronze', max_comandos_dia: limite_diario.limite_tipos.bronze } },
                { multi: true },
            );

            await db.usuarios.asyncUpdate({ id_usuario }, { $set: { tipo: 'dono', max_comandos_dia: null } });
        }
    },

    alterarTipoUsuario: async (id_usuario: string, tipo: string): Promise<boolean> => {
        const { limite_diario } = JSON.parse(fs.readFileSync(path.resolve('database/json/bot.json'), { encoding: 'utf-8' }));

        if (limite_diario.limite_tipos[tipo] || limite_diario.limite_tipos[tipo] == null) {
            await db.usuarios.asyncUpdate({ id_usuario }, { $set: { tipo, max_comandos_dia: limite_diario.limite_tipos[tipo] } });
            return true;
        } else {
            return false;
        }
    },

    limparTipo: async (tipo: string): Promise<boolean> => {
        const { limite_diario } = JSON.parse(fs.readFileSync(path.resolve('database/json/bot.json'), { encoding: 'utf-8' }));

        if (limite_diario.limite_tipos[tipo] === undefined || tipo === 'bronze') return false;

        await db.usuarios.asyncUpdate(
            { tipo },
            { $set: { tipo: 'bronze', max_comandos_dia: limite_diario.limite_tipos.bronze } },
            { multi: true },
        );

        return true;
    },

    ultrapassouLimite: async (id_usuario: string): Promise<boolean> => {
        const usuario = await db.usuarios.asyncFindOne({ id_usuario });

        if (usuario.max_comandos_dia == null) return false;

        return usuario.comandos_dia >= usuario.max_comandos_dia;
    },

    addContagemDiaria: async (id_usuario: string): Promise<void> => {
        db.usuarios.asyncUpdate({ id_usuario }, { $inc: { comandos_total: 1, comandos_dia: 1 } });
    },

    addContagemTotal: async (id_usuario: string): Promise<void> => {
        db.usuarios.asyncUpdate({ id_usuario }, { $inc: { comandos_total: 1 } });
    },

    definirLimite: async (tipo: string, limite: number): Promise<void> => {
        db.usuarios.asyncUpdate({ tipo }, { $set: { max_comandos_dia: limite } }, { multi: true });
    },

    resetarComandosDia: async (): Promise<void> => {
        db.usuarios.asyncUpdate({}, { $set: { comandos_dia: 0 } }, { multi: true });
    },

    resetarComandosDiaUsuario: async (id_usuario: string): Promise<void> => {
        db.usuarios.asyncUpdate({ id_usuario }, { $set: { comandos_dia: 0 } });
    },

    verificarGrupo: async (id_grupo: string): Promise<boolean> => {
        const resp = await db.grupos.asyncFindOne({ id_grupo });
        return resp != null;
    },

    registrarGrupo: async (id_grupo: string, participantes: string[]): Promise<void> => {
        const cadastro_grupo: Grupo = {
            id_grupo,
            participantes,
            mutar: false,
            bemvindo: { status: false, msg: '' },
            antifake: { status: false, ddi_liberados: [] },
            antilink: { status: false, filtros: { youtube: false, whatsapp: false, facebook: false, instagram: false } },
            antitrava: { status: false, max_caracteres: 0 },
            antiflood: { status: false, max: 10, intervalo: 10 },
            antiporno: false,
            autosticker: false,
            voteban: { status: false, max: 5, usuario: '', votos: 0, votou: [] },
            contador: { status: false, inicio: '' },
            enquete: { status: false, pergunta: '', opcoes: [] },
            block_cmds: [],
            lista_negra: [],
        };

        await db.grupos.asyncInsert(cadastro_grupo);
    },

    resetarGrupos: async (): Promise<void> => {
        db.grupos.asyncUpdate(
            {},
            {
                $set: {
                    mutar: false,
                    bemvindo: { status: false, msg: '' },
                    antifake: { status: false, ddi_liberados: [] },
                    antilink: { status: false, filtros: { youtube: false, whatsapp: false, facebook: false, instagram: false } },
                    antitrava: { status: false, max_caracteres: 0 },
                    antiflood: false,
                    antiporno: false,
                    autosticker: false,
                    voteban: { status: false, max: 5, usuario: '', votos: 0, votou: [] },
                    contador: { status: false, inicio: '' },
                    enquete: { status: false, pergunta: '', opcoes: [] },
                    block_cmds: [],
                    lista_negra: [],
                },
            },
            { multi: true },
        );
    },

    obterGrupo: async (id_grupo: string): Promise<Grupo> => {
        const grupo_info = await db.grupos.asyncFindOne({ id_grupo });
        return grupo_info || null;
    },

    obterParticipantesGrupo: async (id_grupo: string): Promise<string[] | false> => {
        const grupo = await db.grupos.asyncFindOne({ id_grupo });
        if (grupo == null) return false;
        return grupo.participantes;
    },

    atualizarParticipantes: async (id_grupo: string, participantes_array: string[]): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { participantes: participantes_array } });
    },

    adicionarParticipante: async (id_grupo: string, participante: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $push: { participantes: participante } });
    },

    removerParticipante: async (id_grupo: string, participante: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $pull: { participantes: participante } });
    },

    participanteExiste: async (id_grupo: string, id_usuario: string): Promise<boolean> => {
        const grupo = await db.grupos.asyncFindOne({ id_grupo });
        return grupo != null && grupo.participantes.includes(id_usuario);
    },

    alterarBemVindo: async (id_grupo: string, status: boolean, msg: string = ''): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { 'bemvindo.status': status, 'bemvindo.msg': msg } });
    },

    alterarAntiFake: async (id_grupo: string, status: boolean = true, ddi: string[] = []): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { 'antifake.status': status, 'antifake.ddi_liberados': ddi } });
    },

    alterarMutar: async (id_grupo: string, status: boolean = true): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { mutar: status } });
    },

    alterarAntiTrava: async (id_grupo: string, status: boolean = true, max_caracteres: number = 2000): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { 'antitrava.status': status, 'antitrava.max_caracteres': max_caracteres } });
    },

    alterarAntiLink: async (
        id_grupo: string,
        status: boolean = true,
        filtros: { youtube: boolean; whatsapp: boolean; facebook: boolean; instagram: boolean } = {
            youtube: false,
            whatsapp: false,
            facebook: false,
            instagram: false,
        },
    ): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { 'antilink.status': status, 'antilink.filtros': filtros } });
    },

    alterarAntiFlood: async (id_grupo: string, status: boolean = true, max: number = 10, intervalo: number = 10): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { antiflood: status } });
        const antifloodJson = JSON.parse(fs.readFileSync(path.resolve('database/json/antiflood.json'), { encoding: 'utf-8' }));
        if (status) {
            antifloodJson.push({
                id_grupo: id_grupo,
                max: Number(max),
                intervalo: Number(intervalo),
                msgs: [],
            });
        } else {
            antifloodJson.splice(
                antifloodJson.findIndex((item: any) => item.id_grupo == id_grupo),
                1,
            );
        }
    },

    alterarAntiPorno: async (id_grupo: string, status: boolean = true): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { antiporno: status } });
    },

    alterarAutoSticker: async (id_grupo: string, status: boolean = true): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { autosticker: status } });
    },

    alterarVoteban: async (
        id_grupo: string,
        status: boolean = true,
        max: number = 5,
        usuario: string = '',
        votos: number = 0,
        votou: string[] = [],
    ): Promise<void> => {
        await db.grupos.asyncUpdate(
            { id_grupo },
            {
                $set: {
                    'voteban.status': status,
                    'voteban.max': max,
                    'voteban.usuario': usuario,
                    'voteban.votos': votos,
                    'voteban.votou': votou,
                },
            },
        );
    },

    alterarContador: async (id_grupo: string, status: boolean = true, inicio: string = dataFormatada): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { 'contador.status': status, 'contador.inicio': inicio } });
    },

    alterarEnquete: async (
        id_grupo: string,
        status: boolean = true,
        pergunta: string = '',
        opcoes: { opcao: string; digito: number; qtd_votos: number; votos: string[] }[] = [],
    ): Promise<void> => {
        await db.grupos.asyncUpdate(
            { id_grupo },
            { $set: { 'enquete.status': status, 'enquete.pergunta': pergunta, 'enquete.opcoes': opcoes } },
        );
    },

    adicionarVotoEnquete: async (id_grupo: string, id_usuario: string, digito: number): Promise<void> => {
        const grupo = await db.grupos.asyncFindOne({ id_grupo });

        if (grupo && grupo.enquete.status) {
            const opcao = grupo.enquete.opcoes.find((op: { digito: number }) => op.digito === digito);

            if (opcao && !opcao.votos.includes(id_usuario)) {
                await db.grupos.asyncUpdate(
                    { id_grupo, 'enquete.opcoes.digito': digito },
                    { $inc: { 'enquete.opcoes.$.qtd_votos': 1 }, $push: { 'enquete.opcoes.$.votos': id_usuario } },
                );
            }
        }
    },

    alterarBlockCmds: async (id_grupo: string, block_cmds: string[] = []): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $set: { block_cmds } });
    },

    adicionarBlockCmd: async (id_grupo: string, block_cmd: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $push: { block_cmds: block_cmd } });
    },

    removerBlockCmd: async (id_grupo: string, block_cmd: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $pull: { block_cmds: block_cmd } });
    },

    obterBlockCmds: async (id_grupo: string): Promise<string[] | false> => {
        const grupo = await db.grupos.asyncFindOne({ id_grupo });
        if (grupo == null) return false;
        return grupo.block_cmds;
    },

    adicionarListaNegra: async (id_grupo: string, id_usuario: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $push: { lista_negra: id_usuario } });
    },

    removerListaNegra: async (id_grupo: string, id_usuario: string): Promise<void> => {
        await db.grupos.asyncUpdate({ id_grupo }, { $pull: { lista_negra: id_usuario } });
    },

    obterListaNegra: async (id_grupo: string): Promise<string[]> => {
        const grupo = await db.grupos.asyncFindOne({ id_grupo });
        if (grupo === null) return [];
        return grupo.lista_negra;
    },

    adicionarMsgContador: async (id_grupo: string, id_usuario: string, tipo: MessageTypes): Promise<void> => {
        const msg_contador: Contador = {
            id_grupo,
            id_usuario,
            id_unico: `${id_grupo}-${id_usuario}-${Date.now()}`,
            msg: tipo === MessageTypes.TEXT ? 1 : 0,
            imagem: tipo === MessageTypes.IMAGE ? 1 : 0,
            gravacao: tipo === MessageTypes.AUDIO ? 1 : 0,
            audio: tipo === MessageTypes.AUDIO ? 1 : 0,
            sticker: tipo === MessageTypes.STICKER ? 1 : 0,
            video: tipo === MessageTypes.VIDEO || tipo === MessageTypes.STICKER ? 1 : 0,
            outro: tipo === MessageTypes.VOICE || tipo === MessageTypes.DOCUMENT ? 1 : 0,
            texto: tipo === MessageTypes.TEXT ? 1 : 0,
        };

        await db.contador.asyncInsert(msg_contador);
    },

    obterContagemUsuario: async (id_usuario: string): Promise<number> => {
        const usuario_contagem = await db.contador.asyncFind({ id_usuario });
        return usuario_contagem.length;
    },

    obterContagemGrupo: async (id_grupo: string): Promise<number> => {
        const grupo_contagem = await db.contador.asyncFind({ id_grupo });
        return grupo_contagem.length;
    },

    obterContagemTipo: async (tipo: MessageTypes): Promise<number> => {
        const tipo_contagem = await db.contador.asyncFind({ [tipo.toLowerCase()]: 1 });
        return tipo_contagem.length;
    },

    resetarContador: async (): Promise<void> => {
        db.contador.asyncRemove({}, { multi: true });
    },

    resetarContadorUsuario: async (id_usuario: string): Promise<void> => {
        db.contador.asyncRemove({ id_usuario }, { multi: true });
    },

    resetarContadorGrupo: async (id_grupo: string): Promise<void> => {
        db.contador.asyncRemove({ id_grupo }, { multi: true });
    },

    resetarContadorTipo: async (tipo: MessageTypes): Promise<void> => {
        db.contador.asyncRemove({ [tipo.toLowerCase()]: 1 }, { multi: true });
    },

    obterDataAtual: (): string => {
        return moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
    },

    registrarContagemTodos: async (id_grupo: string, usuarios: any[]) => {
        for (const usuario of usuarios) {
            const id_unico: string = `${id_grupo}-${usuario.id}`;
            await db.contador.asyncInsert({
                id_grupo,
                id_usuario: usuario.id,
                id_unico,
                msg: 0,
                imagem: 0,
                gravacao: 0,
                audio: 0,
                sticker: 0,
                video: 0,
                outro: 0,
                texto: 0,
            });
        }
    },

    removerContagem: async (id_grupo: string, id_usuario: string) => {
        await db.contador.asyncRemove({ id_grupo, id_usuario });
    },

    removerContagemGrupo: async (id_grupo: string) => {
        await db.contador.asyncRemove({ id_grupo }, { multi: true });
    },

    obterUsuariosAtivos: async (id_grupo: string, limite: number): Promise<Contador[]> => {
        const usuarios_ativos: Contador[] = await db.contador.asyncFind({ id_grupo }, [
            ['sort', { msg: -1 }],
            ['limit', limite],
        ]);
        return usuarios_ativos;
    },

    existeUsuarioContador: async (id_grupo: string, id_usuario: string): Promise<void> => {
        const id_unico: string = `${id_grupo}-${id_usuario}`;
        const contador: Contador | null = await db.contador.asyncFindOne({ id_unico });

        if (contador === null) {
            await db.contador.asyncInsert({
                id_grupo,
                id_usuario,
                id_unico,
                msg: 0,
                imagem: 0,
                gravacao: 0,
                audio: 0,
                sticker: 0,
                video: 0,
                outro: 0,
                texto: 0,
            } as Contador);
        }
    },

    addContagem: async (id_grupo: string, id_usuario: string, tipo_msg: MessageTypes): Promise<void> => {
        let updateQuery: Record<string, number> = {};
        switch (tipo_msg) {
            case MessageTypes.TEXT:
                updateQuery = { msg: 1, texto: 1 };
                break;
            case MessageTypes.IMAGE:
                updateQuery = { msg: 1, imagem: 1 };
                break;
            case MessageTypes.VIDEO:
                updateQuery = { msg: 1, video: 1 };
                break;
            case MessageTypes.STICKER:
                updateQuery = { msg: 1, sticker: 1 };
                break;
            case MessageTypes.VOICE:
                updateQuery = { msg: 1, gravacao: 1 };
                break;
            case MessageTypes.AUDIO:
                updateQuery = { msg: 1, audio: 1 };
                break;
            case MessageTypes.DOCUMENT:
                updateQuery = { msg: 1, outro: 1 };
                break;
        }

        await db.contador.asyncUpdate({ id_grupo, id_usuario }, { $inc: updateQuery });
    },
};
