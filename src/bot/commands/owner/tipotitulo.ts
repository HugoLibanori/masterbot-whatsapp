import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { BotController } from "../../../controllers/BotController.js";

const botController = new BotController();

const command: Command = {
  name: "tipotitulo",
  description: "Altera o tipo de um usuario.",
  category: "owner",
  aliases: ["tipotitulo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    let [userType, titleType] = textReceived.split(",").map((arg) => {
      return arg.trim();
    });
    if (!userType || !titleType)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    const sucesso = await botController.changeTitleUserType(dataBot, userType, titleType);
    if (sucesso)
      await sock.replyText(
        id_chat,
        criarTexto(
          textMessage.admin.tipotitulo.msgs.sucesso,
          userType.toLowerCase().replaceAll(" ", ""),
          titleType,
        ),
        message,
      );
    else await sock.replyText(id_chat, textMessage.admin.tipotitulo.msgs.erro, message);
  },
};

export default command;
