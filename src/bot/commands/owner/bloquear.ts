import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "bloquear",
  description: "Bloqueia um contato.",
  category: "owner",
  aliases: ["bloquear"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      textReceived,
      command,
      grupo: { mentionedJid },
    } = messageContent;

    const numberOwner = await userController.getOwner();
    const usersBlockeds = await sock.getBlockedContacts();

    let userBlock = [];
    if (quotedMsg) {
      userBlock.push(contentQuotedMsg.sender);
    } else if (mentionedJid.length > 1) {
      userBlock = mentionedJid;
    } else {
      const numberInserted = textReceived;
      if (numberInserted.length === 0)
        return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
      userBlock.push(numberInserted.replace(/\W+/g, "") + "@s.whatsapp.net");
    }
    for (const usuario of userBlock) {
      if (numberOwner === usuario) {
        await sock.replyText(
          id_chat,
          criarTexto(
            textMessage.admin.bloquear.msgs.erro_dono,
            usuario.replace(/@s.whatsapp.net/g, ""),
          ),
          message,
        );
      } else {
        if (usersBlockeds.includes(usuario)) {
          await sock.replyText(
            id_chat,
            criarTexto(
              textMessage.admin.bloquear.msgs.ja_bloqueado,
              usuario.replace(/@s.whatsapp.net/g, ""),
            ),
            message,
          );
        } else {
          await sock.blockContact(usuario);
          await sock.replyText(
            id_chat,
            criarTexto(
              textMessage.admin.bloquear.msgs.sucesso,
              usuario.replace(/@s.whatsapp.net/g, ""),
            ),
            message,
          );
        }
      }
    }
  },
};

export default command;
