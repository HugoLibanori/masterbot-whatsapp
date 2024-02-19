import { GroupNotification, Client } from 'whatsapp-web.js';
import { criarTexto } from './util';
import msgs_texto from './msgs';

export default class BemVindo {
    async bemVindo(client: Client, event: GroupNotification, g_info: any) {
        if (g_info.bemvindo.status) {
            const mentions = [];
            const id = event.recipientIds[0];
            const contato = await client.getContactById(id);
            mentions.push(contato);
            const grupo = await client.getChatById(event.chatId);
            const title = grupo.name;
            const msg_customizada = g_info.bemvindo.msg != '' ? g_info.bemvindo.msg + '\n\n' : '';
            const mensagem_bemvindo = criarTexto(msgs_texto.grupo.bemvindo.mensagem, id.replace('@c.us', ''), title, msg_customizada);
            await client.sendMessage(event.chatId, mensagem_bemvindo, { mentions });
        }
    }
}
