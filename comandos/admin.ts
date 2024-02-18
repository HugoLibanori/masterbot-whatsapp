import { Client, MessageMedia } from 'whatsapp-web.js';
import { isAdminGroup, consoleErro } from '../src/util';
import db from '../src/dataBase';
import msgs_texto from '../src/msgs';
import menu from '../src/menu';
import botInfo from '../src/bot';
import fs from 'fs';
import path from 'path';
import { criarTexto, imageToBase64 } from '../src/util';
import { version } from '../package.json';

export default class Admin {
    async admin(client: Client, message: any) {
        try {
            const { body, from, caption, quotedMsg, type } = message;
            const { notifyName, t, author } = message._data;
            const command: string = quotedMsg ? caption : body;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo?.groupMetadata?.participants : '';
            const grupoInfo = isGroup ? await db.obterGrupo(from) : null;
            const args: string[] = command.split(' ');
            const comando = args[0].toLowerCase().trim();
            const formattedTitle: string = (await client.getChatById(from)).name;
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');
            const botNumber = client.info.wid._serialized;
            if (!isOwner) return message.reply(msgs_texto.permissao.apenas_dono_bot);

            if (comando === `${process.env.PREFIX}admin`) {
                await message.reply(menu.menuAdmin());
            } else if (comando === `${process.env.PREFIX}pvliberado`) {
                const novoEstado = !botInfo.botInfo().pvliberado;
                if (novoEstado) {
                    botInfo.botAlterarPvLiberado(true);
                    await message.reply(msgs_texto.admin.pvliberado.ativado);
                } else {
                    botInfo.botAlterarPvLiberado(false);
                    await message.reply(msgs_texto.admin.pvliberado.desativado);
                }
            } else if (comando === `${process.env.PREFIX}infocompleta`) {
                const fotoBot = await client.getProfilePicUrl(botNumber);
                const filePath = path.resolve('database/json/bot.json');
                const infoBot = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
                const nomeCriador = process.env.NOME_ADMINISTRADOR || 'BOT';
                const nomeBot = process.env.NOME_BOT || 'BOT';
                let resposta = criarTexto(msgs_texto.admin.infocompleta.resposta_superior, nomeCriador, nomeBot, version);
                // AUTO-STICKER
                resposta += infoBot.autosticker
                    ? msgs_texto.admin.infocompleta.resposta_variavel.autosticker.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.autosticker.off;
                // PV LIBERADO
                resposta += infoBot.pvliberado
                    ? msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.off;

                if (fotoBot) {
                    const mediaFotoBot = await MessageMedia.fromUrl(fotoBot);
                    await client.sendMessage(from, mediaFotoBot, { caption: resposta });
                } else {
                    await client.sendMessage(from, resposta);
                }
            }
        } catch (err: any) {
            consoleErro(err, 'ADMINISTRAÇÂO');
        }
    }
}
