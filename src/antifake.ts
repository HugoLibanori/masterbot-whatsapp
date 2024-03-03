import { GroupNotification, Client, GroupChat, Contact } from 'whatsapp-web.js';
import { criarTexto, consoleErro } from './util';
import msgs_texto from './msgs';
import db from '../src/dataBase';

export default class AntiFake {
    async antiFake(client: Client, event: GroupNotification, g_info: any) {
        try {
            if (g_info.antifake.status) {
                const nomeBot = process.env.NOME_BOT || 'Bot';
                const dadosGrupo = await client.getChatById(event.chatId);
                const castGrupo = dadosGrupo as unknown;
                const dadosGrupoCast = castGrupo as GroupChat;
                const isGroup = dadosGrupoCast.isGroup;
                const botNumber = client.info.wid._serialized;
                const dadosGrupoBot = isGroup
                    ? dadosGrupoCast.participants
                          .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                          .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
                    : [];
                const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
                if (!isBotGroupAdmin) {
                    await db.alterarAntiFake(event.chatId, false);
                } else {
                    for (const ddi of g_info.antifake.ddi_liberados) {
                        if (event.recipientIds.reduce(id => id).startsWith(ddi)) return true;
                    }
                    const mentions: string[] = [];
                    await dadosGrupoCast.removeParticipants([event.recipientIds.reduce(id => id)]);
                    mentions.push(event.recipientIds.reduce(id => id));
                    await client.sendMessage(
                        event.chatId,
                        criarTexto(
                            msgs_texto.geral.resposta_ban,
                            event.recipientIds.reduce(id => id).replace('@c.us', ''),
                            msgs_texto.grupo.antifake.motivo,
                            nomeBot,
                        ),
                        { mentions },
                    );
                    return false;
                }
            }
            return true;
        } catch (err: any) {
            consoleErro(err.message, 'ANTI-FAKE');
            return false;
        }
    }
}
