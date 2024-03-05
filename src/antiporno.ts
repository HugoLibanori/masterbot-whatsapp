import { Client, MessageMedia, MessageTypes } from 'whatsapp-web.js';
import db from './dataBase';
import { consoleErro, obterNomeAleatorio, criarTexto, isAdminGroup } from './util';
import msgs_texto from './msgs';
import fs from 'fs';
import path from 'path';
import api from './api';

const antiPorno = async (client: Client, message: any) => {
    try {
        const dadosGrupo = await message.getChat();
        const { from, type } = message;
        const { author } = message._data;
        const hasGroup = dadosGrupo.isGroup;
        if (hasGroup && (type === MessageTypes.IMAGE || type === MessageTypes.STICKER)) {
            const { antiporno } = await db.obterGrupo(from);
            if (antiporno) {
                const botNumber = client.info.wid._serialized;
                const isGroup = dadosGrupo.isGroup;
                const dadosAdmin = isGroup ? await dadosGrupo.groupMetadata.participants : '';
                const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
                const dadosGrupoBot = isGroup
                    ? dadosGrupo.participants
                          .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                          .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
                    : [];
                const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
                const nomeBot = process.env.NOME_BOT || '';
                if (isBotGroupAdmin) {
                    if (!isGroupAdmins && (type === MessageTypes.IMAGE || type === MessageTypes.STICKER)) {
                        const mediaData: MessageMedia = await message.downloadMedia();
                        const localArquivo = path.resolve(`media/img/tmp/${obterNomeAleatorio('.png')}`);
                        fs.writeFileSync(localArquivo, mediaData.data, { encoding: 'base64' });
                        fs.unlinkSync(localArquivo);
                        const resp = api.obterNsfw();
                        if ((await resp).nudity.sexual_display >= 0.85) {
                            await dadosGrupo.removeParticipants(from, from);
                            await client.sendMessage(
                                from,
                                criarTexto(
                                    msgs_texto.geral.resposta_ban,
                                    from.replace('@c.us', ''),
                                    msgs_texto.grupo.antiporno.motivo,
                                    nomeBot,
                                ),
                            );
                            return false;
                        }
                    }
                } else {
                    await db.alterarAntiPorno(from, false);
                }
            }
        }
        return true;
    } catch (err) {
        consoleErro(msgs_texto.grupo.antiporno.erro_api, 'ANTI-PORNO');
        return false;
    }
};

export = antiPorno;
