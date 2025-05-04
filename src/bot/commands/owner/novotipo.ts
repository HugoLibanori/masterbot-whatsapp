import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { BotController } from "../../../controllers/BotController.js";

const botController = new BotController();

const command: Command = {
  name: "novotipo",
  description: "Cria um novo tipo de usuário.",
  category: "owner",
  aliases: ["novotipo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    let [userType, titleType, commandsType] = command.split(",").map((arg) => {
      return arg.trim();
    });
    if (!userType || !titleType || !commandsType)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    if (Number(commandsType) !== -1 && (isNaN(Number(commandsType)) || Number(commandsType) < 10))
      return await sock.replyText(id_chat, textMessage.admin.novotipo.msgs.erro_comandos, message);
    const sucesso = await botController.addUserType(
      dataBot,
      userType,
      titleType,
      Number(commandsType),
    );
    if (sucesso)
      await sock.replyText(
        id_chat,
        criarTexto(
          textMessage.admin.novotipo.msgs.sucesso_criacao,
          userType.toLowerCase().replaceAll(" ", ""),
          titleType,
          Number(commandsType) == -1 ? "Sem limite" : commandsType,
        ),
        message,
      );
    else await sock.replyText(id_chat, textMessage.admin.novotipo.msgs.erro_criacao, message);
  },
};

export default command;
