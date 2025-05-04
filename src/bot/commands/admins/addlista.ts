import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "addlista",
  description: "Adiciona usuário na lista negra e remove.",
  category: "admins",
  aliases: ["addlista", "addlist"],
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
    const {
      id_chat,
      sender,
      command,
      quotedMsg,
      contentQuotedMsg,
      grupo,
      textReceived,
      numberBot,
    } = messageContent;

    const { mentionedJid, dataBd, id_group } = grupo || {};

    const { admins = [], lista_negra = [], participantes = [] } = dataBd;

    try {
      let numberList;

      if (quotedMsg) {
        numberList = contentQuotedMsg.sender;
      } else if (mentionedJid.length) {
        const mentioned = mentionedJid[0];
        const cleanNumber = mentioned.replace(/\D+/g, "");
        numberList = `${cleanNumber}@s.whatsapp.net`;
      } else if (args.length && textReceived) {
        const cleanNumber = textReceived.replace(/\D+/g, "");
        numberList = `${cleanNumber}@s.whatsapp.net`;
      }

      if (!numberList) return await sock.sendText(id_chat, commandErrorMsg(command, dataBot));

      if (numberList === numberBot)
        return await sock.replyText(id_chat, textMessage.grupo.addlista.msgs.bot_erro, message);

      if (admins.includes(numberList))
        return await sock.replyText(id_chat, textMessage.grupo.addlista.msgs.admin_erro, message);

      if (lista_negra.includes(numberList))
        return await sock.replyText(id_chat, textMessage.grupo.addlista.msgs.ja_listado, message);

      await grupoController.addListBlack(id_group, numberList);
      await sock.replyText(id_group, textMessage.grupo.addlista.msgs.sucesso, message);

      if (participantes.includes(numberList)) {
        await sock.removerParticipant(id_group, numberList);
      }
    } catch (err: any) {
      if (!err.erro) throw err;
      return await sock.sendText(
        id_chat,
        criarTexto(textMessage.outros.erro_api, command, err.erro),
      );
    }
  },
};

export default command;
