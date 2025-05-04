import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "remlista",
  description: "Remove usuário da lista negra.",
  category: "admins",
  aliases: ["remlista", "remlist", "rl"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command, grupo, textReceived } = messageContent;
    const { dataBd, id_group } = { ...grupo };
    const { lista_negra } = dataBd;

    try {
      if (!args.length) return await sock.sendText(id_chat!, commandErrorMsg(command!, dataBot));

      const numberList = textReceived.replace(/\W+/g, "") + "@s.whatsapp.net";

      if (!lista_negra.includes(numberList))
        return await sock.replyText(id_chat, textMessage.grupo.remlista.msgs.nao_listado, message);
      await grupoController.removeListBlack(id_group, numberList!);
      await sock.replyText(id_group, textMessage.grupo.remlista.msgs.sucesso, message);
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
