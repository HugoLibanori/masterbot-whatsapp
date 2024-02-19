import { Client, MessageTypes } from 'whatsapp-web.js';
import Figurinhas from '../comandos/figurinhas';
import Info from '../comandos/info';
import Grupo from '../comandos/grupo';
import Download from '../comandos/download';
import Admin from '../comandos/admin';
import db from './dataBase';
import { consoleComando, isAdminGroup, consoleErro } from './util';
import { guiaComandoMsg } from './guias';
import comandos from '../comandos/comandos';
import AutoSticker from './sticker';
import botInfo from './bot';

require('dotenv').config();

const lista_comandos = comandos;

export class ChamandoComandos {
    async start(client: Client, message: any) {
        try {
            const { body, from, caption, quotedMsg, type } = message;
            const { notifyName, t, author } = message._data;
            const command: string = quotedMsg ? caption : body;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo?.groupMetadata?.participants : '';
            const grupoInfo = isGroup ? await db.obterGrupo(from) : null;
            const args: string[] = command.split(' ');
            let comando = args[0].toLowerCase().trim();
            const formattedTitle: string = (await client.getChatById(from)).name;
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const msgGuia: boolean = args.length === 2 ? args[1].toLowerCase() === 'guia' : false;
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');

            // COMANDOS
            let comandoExiste =
                lista_comandos.figurinhas.includes(comando) ||
                lista_comandos.grupo.includes(comando) ||
                lista_comandos.info.includes(comando) ||
                lista_comandos.download.includes(comando) ||
                lista_comandos.admin.includes(comando);

            const abrirMenu =
                (comando.match(/comandos|comando|ajuda|menu|help|oi|oii|oiii/gim) && !isGroup && !comandoExiste && !message.fromMe) ||
                false;

            if (abrirMenu) (comando = `${process.env.PREFIX}menu`), (comandoExiste = true);

            // VERIFICANDO COMANDOS
            if (comandoExiste) {
                // SE FOR   ALGUM COMANDO EXISTENTE
                if (lista_comandos.figurinhas.includes(comando)) {
                    if (msgGuia) return await message.reply(guiaComandoMsg('figurinhas', comando));
                    const formattedTitle: string = (await client.getChatById(from)).name;
                    consoleComando(isGroup, 'FIGURINHAS', comando, '#ae45d1', t, notifyName, formattedTitle);
                    new Figurinhas().criarFigurinhas(client, message);
                } else if (lista_comandos.info.includes(comando)) {
                    if (msgGuia) return await message.reply(guiaComandoMsg('info', comando));
                    const formattedTitle: string = (await client.getChatById(from)).name;
                    consoleComando(isGroup, 'INFO', comando, '#ae45d1', t, notifyName, formattedTitle);
                    new Info().info(client, message, abrirMenu);
                } else if (lista_comandos.grupo.includes(comando)) {
                    if (msgGuia) return await message.reply(guiaComandoMsg('grupo', comando));
                    const formattedTitle: string = (await client.getChatById(from)).name;
                    if (isGroup) consoleComando(isGroup, 'GRUPO', comando, '#ae45d1', t, notifyName, formattedTitle);
                    new Grupo().grupo(client, message);
                } else if (lista_comandos.download.includes(comando)) {
                    if (msgGuia) return await message.reply(guiaComandoMsg('downloads', comando));
                    const formattedTitle: string = (await client.getChatById(from)).name;
                    consoleComando(isGroup, 'DOWNLOAD', comando, '#ae45d1', t, notifyName, formattedTitle);
                    new Download().download(client, message);
                } else if (lista_comandos.admin.includes(comando)) {
                    if (msgGuia) return await message.reply(guiaComandoMsg('admin', comando));
                    const formattedTitle: string = (await client.getChatById(from)).name;
                    consoleComando(isGroup, 'ADMIN', comando, '#ae45d1', t, notifyName, formattedTitle);
                    new Admin().admin(client, message);
                }
            } else {
                //SE NÃO FOR UM COMANDO EXISTENTE
                //AUTO-STICKER GRUPO
                if (isGroup && (type === MessageTypes.IMAGE || type === MessageTypes.VIDEO) && grupoInfo?.autosticker) {
                    //SE O GRUPO ESTIVER COM O RECURSO 'MUTADO' LIGADO E USUARIO NÃO FOR ADMINISTRADOR
                    if (isGroup && !isGroupAdmins && grupoInfo?.mutar) return;

                    AutoSticker.autoSticker(message, client);
                    consoleComando(isGroup, 'FIGURINHAS', 'AUTO-STICKER', '#ae45d1', t, notifyName, formattedTitle);
                }
                //AUTO-STICKER PRIVADO
                if (!isGroup && (type === MessageTypes.IMAGE || type === MessageTypes.VIDEO) && botInfo.botInfo().autosticker) {
                    AutoSticker.autoSticker(message, client);
                    consoleComando(isGroup, 'FIGURINHAS', 'AUTO-STICKER', '#ae45d1', t, notifyName, formattedTitle);
                }
            }
        } catch (err: any) {
            consoleErro(err.message, 'CHAMANDO COMANDOS');
        }
    }
}
