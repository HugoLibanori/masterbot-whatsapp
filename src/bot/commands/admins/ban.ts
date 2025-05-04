import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "ban",
  description: "Remove um usuário do grupo.",
  category: "admin",
  aliases: ["ban"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  isBotAdmin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, quotedMsg, contentQuotedMsg, grupo, command, sender } = messageContent;

    const {
      mentionedJid,
      dataBd: { participantes, admins },
      id_group,
    } = grupo;

    const arrayNumber: string[] = [];

    console.log();

    if (quotedMsg) {
      arrayNumber.push(contentQuotedMsg.sender);
    } else if (mentionedJid.length) {
      const mentioned = mentionedJid[0];
      const cleanNumber = mentioned.replace(/\D+/g, "");
      arrayNumber.push(`${cleanNumber}@s.whatsapp.net`);
    } else {
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    }

    const idPartipants = participantes;

    for (const usuario of arrayNumber) {
      if (idPartipants.includes(usuario)) {
        if (!admins.includes(usuario)) {
          await sock.removerParticipant(id_group, usuario).then(async () => {
            if (arrayNumber.length === 1) {
              await sock.sendTextWithMentions(
                id_chat,
                criarTexto(
                  textMessage.outros.resposta_ban,
                  usuario.replace("@s.whatsapp.net", ""),
                  textMessage.grupo.ban.msgs.motivo,
                  sender.replace("@s.whatsapp.net", ""),
                ),
                [sender, usuario],
              );
            }
          });
        } else {
          if (arrayNumber.length === 1)
            await sock.replyText(id_chat, textMessage.grupo.ban.msgs.banir_admin, message);
        }
      } else {
        if (arrayNumber.length === 1)
          await sock.replyText(id_chat, textMessage.grupo.ban.msgs.banir_erro, message);
      }
    }
  },
};

export default command;
