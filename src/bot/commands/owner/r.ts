import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "r",
  description: "Reseta os comandos diarios de um usuario.",
  category: "owner",
  aliases: ["r"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      textReceived,
      quotedMsg,
      contentQuotedMsg,
      grupo: { mentionedJid },
      command,
    } = messageContent;

    if (!dataBot.limite_diario?.status)
      return await sock.replyText(id_chat, textMessage.admin.r.msgs.erro_limite_diario, message);
    let usuarioResetado;
    if (quotedMsg) usuarioResetado = contentQuotedMsg.sender;
    else if (mentionedJid.length) usuarioResetado = mentionedJid[0];
    else if (args.length) usuarioResetado = textReceived.replace(/\W+/g, "") + "@s.whatsapp.net";
    else return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    let usuarioRegistrado = await userController.getUser(usuarioResetado);
    if (usuarioRegistrado) {
      await userController.resetUserDayCommands(usuarioResetado);
      await sock.replyText(id_chat, textMessage.admin.r.msgs.sucesso, message);
    } else {
      await sock.replyText(id_chat, textMessage.admin.r.msgs.nao_registrado, message);
    }
  },
};

export default command;
