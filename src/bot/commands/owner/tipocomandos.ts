import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { BotController } from "../../../controllers/BotController.js";

const botController = new BotController();

const command: Command = {
  name: "tipocomandos",
  description: "Altera a quantidade de comandos por cada tipo",
  category: "owner",
  aliases: ["tipocomandos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command } = messageContent;

    const botInfo = dataBot;
    if (!botInfo.limite_diario?.status)
      return await sock.replyText(
        id_chat,
        textMessage.admin.tipocomandos.msgs.erro_limite_diario,
        message,
      );
    if (args.length < 2)
      return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
    let [tipo, qtd] = args;
    if (Number(qtd) != -1)
      if (isNaN(Number(qtd)) || Number(qtd) < 5)
        return await sock.replyText(id_chat, textMessage.admin.tipocomandos.msgs.invalido, message);
    let alterou = await botController.changeUserTypeCommands(
      tipo.toLowerCase(),
      parseInt(qtd),
      botInfo,
    );
    if (!alterou)
      return await sock.replyText(
        id_chat,
        textMessage.admin.tipocomandos.msgs.tipo_invalido,
        message,
      );
    await sock.replyText(
      id_chat,
      criarTexto(
        textMessage.admin.tipocomandos.msgs.sucesso,
        tipo.toUpperCase(),
        Number(qtd) == -1 ? "∞" : qtd,
      ),
      message,
    );
  },
};

export default command;
