import { GroupNotification, Client, GroupChat } from 'whatsapp-web.js';
import { criarTexto } from './util';
import msgs_texto from './msgs';

export default class BemVindo {
    async bemVindo(client: Client, event: GroupNotification, g_info: any) {
        if (g_info.bemvindo.status) {
            const mentions = [];
            const idArray = event.recipientIds;
            for (const id of idArray) {
                mentions.push(id);
                const grupo = await client.getChatById(event.chatId);
                const dadosGrupo = grupo as GroupChat;
                const title = grupo.name;
                const msg_customizada = g_info.bemvindo.msg != '' ? g_info.bemvindo.msg + '\n\n' : '';
                const mensagem_bemvindo = criarTexto(msgs_texto.grupo.bemvindo.mensagem, id.replace('@c.us', ''), title, msg_customizada);
                await client.sendMessage(event.chatId, mensagem_bemvindo, { mentions });
                await client.sendMessage(event.chatId, dadosGrupo.description);
            }
        }
    }
}
