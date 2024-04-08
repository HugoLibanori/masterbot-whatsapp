import path from 'path';
import { criarTexto } from './util';
import db from './dataBase';
import botInfo from './bot';
import comandos from '../comandos/comandos';
import msgs_texto from './msgs';

const listaComandos = comandos;

export = {
    bloquearComandosGlobal: async (usuarioComandos: string[]) => {
        const comandosBloqueados: string[] = [];
        let respostaBloqueio = msgs_texto.admin.bcmdglobal.resposta_titulo;
        const categorias = ['figurinhas', 'utilidades', 'download', 'diversão'],
            primeiroComando = usuarioComandos[0];

        if (categorias.includes(primeiroComando)) {
            let comandosCategoria: string[] = [];
            switch (primeiroComando) {
                case 'figurinhas':
                    comandosCategoria = listaComandos.figurinhas;
                    break;
                case 'utilidades':
                    comandosCategoria = listaComandos.utilidades;
                    break;
                case 'download':
                    comandosCategoria = listaComandos.download;
                    break;
                case 'diversão':
                    comandosCategoria = listaComandos.diversao;
                    break;
            }

            for (const comando of comandosCategoria) {
                if (botInfo.botInfo().bloqueio_cmds.includes(comando)) {
                    respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.ja_bloqueado, comando);
                } else {
                    comandosBloqueados.push(comando);
                    respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.bloqueado_sucesso, comando);
                }
            }
        } else {
            for (const comando of usuarioComandos) {
                if (
                    listaComandos.utilidades.includes(comando) ||
                    listaComandos.diversao.includes(comando) ||
                    listaComandos.figurinhas.includes(comando) ||
                    listaComandos.download.includes(comando)
                ) {
                    if (botInfo.botInfo().bloqueio_cmds.includes(comando)) {
                        respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.ja_bloqueado, comando);
                    } else {
                        comandosBloqueados.push(comando);
                        respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.bloqueado_sucesso, comando);
                    }
                } else if (
                    listaComandos.grupo.includes(comando) ||
                    listaComandos.admin.includes(comando) ||
                    listaComandos.info.includes(comando)
                ) {
                    respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.erro, comando);
                } else {
                    respostaBloqueio += criarTexto(msgs_texto.admin.bcmdglobal.resposta_variavel.nao_existe, comando);
                }
            }
        }

        if (comandosBloqueados.length !== 0) botInfo.botBloquearComando(comandosBloqueados);
        return respostaBloqueio;
    },

    desbloquearComandosGlobal: async (usuarioComandos: string[]) => {
        const comandosDesbloqueados: string[] = [];
        let respostaDesbloqueio = msgs_texto.admin.dcmdglobal.resposta_titulo;
        const categorias = ['todos', 'figurinhas', 'utilidades', 'download', 'diversão'],
            primeiroComando = usuarioComandos[0];
        if (categorias.includes(primeiroComando)) {
            let comandosCategoria: string[] = [];
            switch (primeiroComando) {
                case 'todos':
                    comandosCategoria = botInfo.botInfo().bloqueio_cmds;
                    break;
                case 'figurinhas':
                    comandosCategoria = listaComandos.figurinhas;
                    break;
                case 'utilidades':
                    comandosCategoria = listaComandos.utilidades;
                    break;
                case 'download':
                    comandosCategoria = listaComandos.download;
                    break;
                case 'diversão':
                    comandosCategoria = listaComandos.diversao;
                    break;
            }

            for (const comando of comandosCategoria) {
                if (botInfo.botInfo().bloqueio_cmds.includes(comando)) {
                    comandosDesbloqueados.push(comando);
                    respostaDesbloqueio += criarTexto(msgs_texto.admin.dcmdglobal.resposta_variavel.desbloqueado_sucesso, comando);
                } else {
                    respostaDesbloqueio += criarTexto(msgs_texto.admin.dcmdglobal.resposta_variavel.ja_desbloqueado, comando);
                }
            }
        } else {
            for (const comando of usuarioComandos) {
                if (botInfo.botInfo().bloqueio_cmds.includes(comando)) {
                    comandosDesbloqueados.push(comando);
                    respostaDesbloqueio += criarTexto(msgs_texto.admin.dcmdglobal.resposta_variavel.desbloqueado_sucesso, comando);
                } else {
                    respostaDesbloqueio += criarTexto(msgs_texto.admin.dcmdglobal.resposta_variavel.ja_desbloqueado, comando);
                }
            }
        }

        if (comandosDesbloqueados.length !== 0) botInfo.botDesbloquearComando(comandosDesbloqueados);
        return respostaDesbloqueio;
    },

    verificarBloqueioGlobal: async (comando: string) => {
        return botInfo.botInfo().bloqueio_cmds.includes(comando);
    },
};
