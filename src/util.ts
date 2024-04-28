const chalk = require('chalk');
import fs from 'fs';
import path from 'path';
import { criacaoEnv } from './env';
import { botInfo } from './bot';
import axios from 'axios';

const corTexto = (texto: string | undefined, cor?: string) => {
    return !cor ? chalk.green(texto) : chalk.hex(cor)(texto);
};

const consoleComando = (
    isGroup: boolean,
    categoria: string,
    comando: string,
    hex: string,
    timestampMsg: number,
    nomeUsuario: string,
    nomeChat?: string,
) => {
    const tMensagem = timestampParaData(timestampMsg);

    if (isGroup) {
        console.log(
            '\x1b[1;31m~\x1b[1;37m>',
            corTexto(`[GRUPO - ${categoria}]`, hex),
            tMensagem,
            corTexto(comando),
            'de',
            corTexto(nomeUsuario),
            'em',
            corTexto(nomeChat || 'Chat'),
        );
    } else {
        console.log(
            '\x1b[1;31m~\x1b[1;37m>',
            corTexto(`[PRIVADO - ${categoria}]`, hex),
            tMensagem,
            corTexto(comando),
            'de',
            corTexto(nomeUsuario),
        );
    }
};

const timestampParaData = (timestampMsg: number): string => {
    const data = new Date(timestampMsg);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos}:${segundos}`;
    return dataFormatada;
};

const removerNegritoComando = (comando: string): string => {
    return comando.replace(/\*/gm, '').trim();
};

const obterNomeAleatorio = (ext: string): string => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

const criarTexto = (texto: string, ...params: string[]): string => {
    for (let i = 0; i < params.length; i++) {
        texto = texto.replace(`{p${i + 1}}`, params[i]);
    }
    return texto;
};

const erroComandoMsg = (comando: string): string => {
    return criarTexto(
        '[❗] Ops, parece que você usou o comando *{p1}* incorretamente. Quer aprender a usar?\n\n Digite :\n  - Ex: *{p2} guia* para ver o guia.',
        comando,
        comando,
    );
};

interface GroupMember {
    id: {
        server: string;
        user: string;
        _serialized: string;
    };
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const isAdminGroup = (contato: string, arrayContato: GroupMember[], verificaUser: boolean = false): boolean => {
    if (!verificaUser) {
        const memberGroup = arrayContato.find(numero => {
            return numero?.id?._serialized === contato && numero?.isAdmin;
        });
        const isAdmin = memberGroup?.isAdmin;
        return !!isAdmin;
    } else {
        const memberGroup = arrayContato.find(numero => numero.id._serialized === contato);
        return !!memberGroup;
    }
};

const consoleErro = (msg: string, tipoErro = 'API'): void => {
    console.error(corTexto(`[${tipoErro}]`, '#d63e3e'), msg);
};

const criarArquivosNecessarios = async (): Promise<boolean> => {
    try {
        const existeBotJson = fs.existsSync(path.resolve('database/json/bot.json'));
        const existeEnv = fs.existsSync(path.resolve('.env'));
        const pastaFigu = fs.existsSync(path.resolve('figurinhas'));
        const pastaTmp = fs.existsSync(path.resolve('media/img/tmp'));

        if (existeBotJson && existeEnv) {
            return false;
        }

        if (!pastaFigu) {
            fs.mkdirSync(path.resolve(__dirname, '..', 'figurinhas'), { recursive: true });
        }

        if (!pastaTmp) {
            fs.mkdirSync(path.resolve(__dirname, '..', 'media', 'img', 'tmp'), { recursive: true });
        }

        if (!existeBotJson) {
            // CRIA O ARQUIVO COM AS INFORMAÇÕES INICIAIS DO BOT
            await botInfo.botCriarArquivo();
        }

        if (!existeEnv) {
            // CRIA O ARQUIVO .ENV
            await criacaoEnv();
        }

        return true;
    } catch (err: any) {
        console.log(err);
        throw new Error(err);
    }
};

const imageToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64Data = Buffer.from(response.data, 'binary').toString('base64');
        return `data:${response.headers['content-type']};base64,${base64Data}`;
    } catch (error: any) {
        console.error('Erro ao converter imagem para base64:', error.message);
        throw error;
    }
};

export {
    consoleComando,
    corTexto,
    timestampParaData,
    removerNegritoComando,
    obterNomeAleatorio,
    criarTexto,
    erroComandoMsg,
    isAdminGroup,
    consoleErro,
    criarArquivosNecessarios,
    imageToBase64,
};
