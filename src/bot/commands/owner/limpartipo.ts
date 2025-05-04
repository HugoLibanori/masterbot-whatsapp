import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "limpartipo",
  description: "Altera membros de um tipo em membros comum.",
  category: "owner",
  aliases: ["limpartipo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command, textReceived } = messageContent;

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    let tipo = textReceived.toLowerCase();
    let limpou = await userController.cleanType(tipo, dataBot);
    if (!limpou)
      return await sock.replyText(id_chat, textMessage.admin.limpartipo.msgs.erro, message);
    await sock.replyText(
      id_chat,
      criarTexto(textMessage.admin.limpartipo.msgs.sucesso, tipo.toUpperCase()),
      message,
    );
  },
};

export default command;
