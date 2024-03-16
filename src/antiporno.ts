import { Client, MessageMedia, MessageTypes } from 'whatsapp-web.js';
import db from './dataBase';
import { consoleErro, obterNomeAleatorio, criarTexto, isAdminGroup } from './util';
import msgs_texto from './msgs';
import fs from 'fs';
import path from 'path';
import api from './api';

export default class AntiPorno {
    async antiPorno(client: Client, message: any) {
        try {
            const dadosGrupo = await message.getChat();
            const { from, type } = message;
            const { author } = message._data;
            const hasGroup = dadosGrupo.isGroup;
            if (hasGroup && (type === MessageTypes.IMAGE || type === MessageTypes.STICKER)) {
                const grupoInfo = await db.obterGrupo(from);
                if (grupoInfo.antiporno) {
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
                            const resp = await api.obterNsfw(localArquivo);
                            if (
                                resp.data['nudity']['sexual_display'] >= 0.6 ||
                                resp.data['nudity']['sexual_activity'] >= 0.6 ||
                                resp.data['nudity']['erotica'] >= 0.6
                            ) {
                                await dadosGrupo.removeParticipants([author]);
                                await client.sendMessage(
                                    from,
                                    criarTexto(
                                        msgs_texto.geral.resposta_ban,
                                        author.replace('@c.us', ''),
                                        msgs_texto.grupo.antiporno.motivo,
                                        nomeBot,
                                    ),
                                    { mentions: author },
                                );
                                await message.delete(true);
                                fs.unlinkSync(localArquivo);
                                return false;
                            } else {
                                fs.unlinkSync(localArquivo);
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
    }
}
