import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "gadometro",
  description: "Mostra nivel do gadometro.",
  category: "users",
  aliases: ["gadometro"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: false,
  owner: false,
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
      grupo: { mentionedJid },
      command,
      contentQuotedMsg,
    } = messageContent;
    const botInfo = dataBot;
    const numberOwner = await userController.getOwner();

    try {
      if (!quotedMsg && mentionedJid.length == 0)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      if (mentionedJid.length > 1)
        return await sock.replyText(
          id_chat,
          textMessage.diversao.gadometro.msgs.apenas_um,
          message,
        );
      let respostas = textMessage.diversao.gadometro.msgs.respostas;
      let indexAleatorio = Math.floor(Math.random() * respostas.length),
        idResposta = null,
        alvo = null;
      if (mentionedJid.length == 1) {
        idResposta = message;
        alvo = mentionedJid[0];
      } else {
        idResposta = contentQuotedMsg.message;
        alvo = contentQuotedMsg.sender;
      }
      if (numberOwner === alvo) indexAleatorio = 0;
      let respostaTexto = criarTexto(
        textMessage.diversao.gadometro.msgs.resposta,
        respostas[indexAleatorio],
      );
      await sock.replyText(id_chat, respostaTexto, idResposta!);
    } catch (err) {
      console.log(err);
    }
  },
};

export default command;
