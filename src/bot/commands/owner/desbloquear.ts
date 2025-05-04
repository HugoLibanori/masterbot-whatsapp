import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "desbloquear",
  description: "Desbloqueia um contato.",
  category: "owner",
  aliases: ["desbloquear"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: true,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const {
      id_chat,
      quotedMsg,
      contentQuotedMsg,
      grupo: { mentionedJid },
      textReceived,
      command,
    } = messageContent;

    const usersBlockeds = await sock.getBlockedContacts();

    let usersUnblocked = [];
    if (quotedMsg) {
      usersUnblocked.push(contentQuotedMsg.sender);
    } else if (mentionedJid.length > 1) {
      usersUnblocked = mentionedJid;
    } else {
      const numeroInserido = textReceived;
      if (numeroInserido.length == 0)
        return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
      usersUnblocked.push(numeroInserido.replace(/\W+/g, "") + "@s.whatsapp.net");
    }
    for (const usuario of usersUnblocked) {
      if (!usersBlockeds.includes(usuario)) {
        await sock.replyText(
          id_chat,
          criarTexto(
            textMessage.admin.desbloquear.msgs.ja_desbloqueado,
            usuario.replace(/@s.whatsapp.net/g, ""),
          ),
          message,
        );
      } else {
        await sock.unblockContact(usuario);
        await sock.replyText(
          id_chat,
          criarTexto(
            textMessage.admin.desbloquear.msgs.sucesso,
            usuario.replace(/@s.whatsapp.net/g, ""),
          ),
          message,
        );
      }
    }
  },
};

export default command;
