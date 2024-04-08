import path from 'path';
import fs from 'fs-extra';
import msgs_texto from './msgs';
import moment from 'moment-timezone';
import db from '../src/dataBase';

interface Bot {
    iniciado: number;
    cmds_executados: number;
    autosticker: boolean;
    bloqueio_cmds: string[];
    antitrava: {
        status: boolean;
        max_caracteres: number;
    };
    limite_diario: {
        status: boolean;
        expiracao: number;
        limite_tipos: {
            bronze: number;
            prata: number;
            ouro: number;
            vip: number;
        };
    };
    limitarmensagens: {
        status: boolean;
        max: number;
        intervalo: number;
        msgs: Array<{
            id_usuario: string;
            expiracao: number;
            qtd: number;
        }>;
    };
    limitecomandos: {
        status: boolean;
        cmds_minuto_max: number;
        tempo_bloqueio: number;
        usuarios: Array<{
            usuario_id: string;
            cmds: number;
            expiracao: number;
        }>;
        usuarios_limitados: Array<{
            usuario_id: string;
            horario_liberacao: number;
        }>;
    };
    pvliberado: boolean;
}

const botFilePath = path.resolve('database/json/bot.json');

const bot: Bot = {
    iniciado: 0,
    cmds_executados: 0,
    autosticker: false,
    bloqueio_cmds: [],
    antitrava: {
        status: false,
        max_caracteres: 0,
    },
    limite_diario: {
        status: false,
        expiracao: 0,
        limite_tipos: {
            bronze: 25,
            prata: 50,
            ouro: 100,
            vip: 1000000,
        },
    },
    limitarmensagens: {
        status: false,
        max: 10,
        intervalo: 10,
        msgs: [],
    },
    limitecomandos: {
        status: false,
        cmds_minuto_max: 5,
        tempo_bloqueio: 60,
        usuarios: [],
        usuarios_limitados: [],
    },
    pvliberado: true,
};

export const botInfo = {
    botCriarArquivo: async () => {
        await fs.writeFile(botFilePath, JSON.stringify(bot));
    },

    botInfoUpdate: () => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.cmds_executados += 1;
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botInfo: () => {
        const dados: Bot = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        return dados;
    },

    botStart: async () => {
        try {
            const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
            botData.iniciado = moment.now();
            fs.writeFileSync(botFilePath, JSON.stringify(botData));
            return msgs_texto.inicio.dados_bot;
        } catch (err) {
            console.error(err);
            throw new Error('Erro no botStart');
        }
    },

    botAlterarPvLiberado: async (status = true) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.pvliberado = status;
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botAlterarAutoSticker: async (status = true) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.autosticker = status;
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botAlterarAntitrava: async (status = true, maxCaracteres = 1500) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.antitrava.status = status;
        botData.antitrava.max_caracteres = maxCaracteres;
        await fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botQtdLimiteDiario: async (tipo: string, limite: number | null) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        if (limite == -1) limite = null;
        if (botData.limite_diario.limite_tipos[tipo] === undefined) return false;
        botData.limite_diario.limite_tipos[tipo] = Number(limite);
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
        await db.definirLimite(tipo, Number(limite));
        return true;
    },

    botAlterarLimiteDiario: async (status: boolean) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        const timestamp_atual = Math.round(new Date().getTime() / 1000);
        botData.limite_diario.expiracao = status ? timestamp_atual + 86400 : 0;
        botData.limite_diario.status = status;
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
        if (status) {
            for (const tipo in botData.limite_diario.limite_tipos) {
                await db.definirLimite(tipo, parseInt(botData.limite_diario.limite_tipos[tipo]));
            }
        } else {
            await db.resetarComandosDia();
            for (const tipo in botData.limite_diario.limite_tipos) {
                await db.definirLimite(tipo, 0);
            }
        }
    },

    botVerificarExpiracaoLimite: async () => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        const timestamp_atual = Math.round(new Date().getTime() / 1000);
        if (timestamp_atual >= botData.limite_diario.expiracao) {
            await db.resetarComandosDia();
            botData.limite_diario.expiracao = timestamp_atual + 86400;
            fs.writeFileSync(botFilePath, JSON.stringify(botData));
        }
    },

    botAlterarLimitador: async (status = true, cmds_minuto = 5, tempo_bloqueio = 60) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.limitecomandos.status = status;
        botData.limitecomandos.cmds_minuto_max = cmds_minuto;
        botData.limitecomandos.tempo_bloqueio = tempo_bloqueio;
        botData.limitecomandos.usuarios = [];
        botData.limitecomandos.usuarios_limitados = [];
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botLimitarComando: async (usuario_id: string, tipo_usuario: string, isAdmin: boolean) => {
        const { criarTexto } = require(path.resolve('src/util.ts'));
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        const timestamp_atual = Math.round(new Date().getTime() / 1000);
        let resposta = {};

        for (let i = 0; i < botData.limitecomandos.usuarios_limitados.length; i++) {
            if (botData.limitecomandos.usuarios_limitados[i].horario_liberacao <= timestamp_atual)
                botData.limitecomandos.usuarios_limitados.splice(i, 1);
        }

        for (let i = 0; i < botData.limitecomandos.usuarios.length; i++) {
            if (botData.limitecomandos.usuarios[i].expiracao <= timestamp_atual) botData.limitecomandos.usuarios.splice(i, 1);
        }

        if (tipo_usuario == 'dono' || isAdmin) {
            resposta = { comando_bloqueado: false };
        } else {
            const usuarioIndexLimitado = botData.limitecomandos.usuarios_limitados.findIndex(
                (usuario: { usuario_id: string }) => usuario.usuario_id == usuario_id,
            );

            if (usuarioIndexLimitado != -1) {
                resposta = { comando_bloqueado: true };
            } else {
                const usuarioIndex = botData.limitecomandos.usuarios.findIndex(
                    (usuario: { usuario_id: string }) => usuario.usuario_id == usuario_id,
                );

                if (usuarioIndex != -1) {
                    botData.limitecomandos.usuarios[usuarioIndex].cmds++;
                    if (botData.limitecomandos.usuarios[usuarioIndex].cmds >= botData.limitecomandos.cmds_minuto_max) {
                        botData.limitecomandos.usuarios_limitados.push({
                            usuario_id,
                            horario_liberacao: timestamp_atual + botData.limitecomandos.tempo_bloqueio,
                        });
                        botData.limitecomandos.usuarios.splice(usuarioIndex, 1);
                        resposta = {
                            comando_bloqueado: true,
                            msg: criarTexto(
                                msgs_texto.admin.limitecomandos.resposta_usuario_limitado,
                                botData.limitecomandos.tempo_bloqueio,
                            ),
                        };
                    } else {
                        resposta = { comando_bloqueado: false };
                    }
                } else {
                    botData.limitecomandos.usuarios.push({
                        usuario_id,
                        cmds: 1,
                        expiracao: timestamp_atual + 60,
                    });
                    resposta = { comando_bloqueado: false };
                }
            }
        }

        fs.writeFileSync(botFilePath, JSON.stringify(botData));
        return resposta;
    },

    botAlterarLimitarMensagensPv: async (status: boolean, max = 10, intervalo = 10) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        botData.limitarmensagens.status = status;
        botData.limitarmensagens.max = max;
        botData.limitarmensagens.intervalo = intervalo;
        fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botLimitarMensagensPv: async (usuario_msg: string, usuario_tipo: string) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        const timestamp_atual = Math.round(new Date().getTime() / 1000);
        let resposta = {};

        for (let i = 0; i < botData.limitarmensagens.msgs.length; i++) {
            if (timestamp_atual >= botData.limitarmensagens.msgs[i].expiracao) botData.limitarmensagens.msgs.splice(i, 1);
        }

        if (usuario_tipo == 'dono') {
            resposta = { bloquear_usuario: false };
        } else {
            const usuarioIndex = botData.limitarmensagens.msgs.findIndex(
                (usuario: { id_usuario: string }) => usuario.id_usuario == usuario_msg,
            );

            if (usuarioIndex != -1) {
                botData.limitarmensagens.msgs[usuarioIndex].qtd++;
                const max_msg = botData.limitarmensagens.max;
                if (botData.limitarmensagens.msgs[usuarioIndex].qtd >= max_msg) {
                    botData.limitarmensagens.msgs.splice(usuarioIndex, 1);
                    resposta = {
                        bloquear_usuario: true,
                        msg: msgs_texto.admin.limitarmsgs.resposta_usuario_bloqueado,
                    };
                } else {
                    resposta = { bloquear_usuario: false };
                }
            } else {
                botData.limitarmensagens.msgs.push({
                    id_usuario: usuario_msg,
                    expiracao: timestamp_atual + botData.limitarmensagens.intervalo,
                    qtd: 1,
                });
                resposta = { bloquear_usuario: false };
            }
        }

        fs.writeFileSync(botFilePath, JSON.stringify(botData));
        return resposta;
    },

    botBloquearComando: async (cmds: string[]) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        for (const cmd of cmds) {
            botData.bloqueio_cmds.push(cmd);
        }
        await fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },

    botDesbloquearComando: async (cmds: string[]) => {
        const botData = JSON.parse(fs.readFileSync(botFilePath, { encoding: 'utf-8' }));
        for (const cmd of cmds) {
            const index = botData.bloqueio_cmds.findIndex((cmd_block: string) => cmd_block == cmd);
            if (index != -1) {
                botData.bloqueio_cmds.splice(index, 1);
            }
        }
        await fs.writeFileSync(botFilePath, JSON.stringify(botData));
    },
};

export default botInfo;
