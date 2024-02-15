import { Client, MessageMedia, Message } from 'whatsapp-web.js';
import { consoleComando, isAdminGroup, consoleErro } from '../src/util';
import db from '../src/dataBase';
import msgs_texto from '../src/msgs';
import menu from '../src/menu';

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
            const isOwner = ownerNumber === author.replace(/@c.us/g, '');
            if (!isOwner) return message.reply(msgs_texto.permissao.apenas_dono_bot);

            if (comando === `${process.env.PREFIX}admin`) {
                await message.reply(menu.menuAdmin());
            }
        } catch (err: any) {
            consoleErro(err.message, 'ADMINISTRAÇÂO');
        }
    }
}
