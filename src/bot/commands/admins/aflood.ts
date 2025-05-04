import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";
import { criarTexto } from "../../../lib/utils.js";

const grupos = new GrupoController();

const command: Command = {
  name: "aflood",
  description: "Ativa e desativa o anti-flood do grupo.",
  category: "admins",
  aliases: ["aflood"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo } = messageContent;
    const { id_group: id_grupo, dataBd } = { ...grupo };

    let intervalo = 10,
      maxMensagem = 10,
      estadoNovo = !dataBd?.antiflood?.status;

    if (args.length == 2) [maxMensagem, intervalo] = [parseInt(args[0]), parseInt(args[1])];
    else if (args.length == 1) [maxMensagem] = [parseInt(args[0])];

    //Filtro - intervalo
    if (isNaN(intervalo) || intervalo < 10 || intervalo > 60) {
      return await sock.replyText(id_chat, textMessage.grupo.aflood.msgs.intervalo, message);
    }
    //Filtro - maxMensagem
    if (isNaN(maxMensagem) || maxMensagem < 5 || maxMensagem > 20) {
      return sock.replyText(id_chat, textMessage.grupo.aflood.msgs.max, message);
    }

    if (estadoNovo) {
      await grupos.changeAntiFlood(id_grupo, true, maxMensagem, intervalo);
      await sock.replyText(
        id_chat,
        criarTexto(
          textMessage.grupo.aflood.msgs.ligado,
          maxMensagem.toString(),
          intervalo.toString(),
        ),
        message,
      );
    } else {
      await grupos.changeAntiFlood(id_grupo, false, 0, 0);
      await sock.replyText(id_chat, textMessage.grupo.aflood.msgs.desligado, message);
    }
  },
};

export default command;
