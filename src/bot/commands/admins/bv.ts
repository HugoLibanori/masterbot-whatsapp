import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "bv",
  description: "Ativa e desativa bem vindo ao grupo",
  category: "admins",
  aliases: ["bv"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { grupo, textReceived } = messageContent;
    const { dataBd, id_group } = { ...grupo };
    const estadoNovo = !dataBd.bemvindo.status;
    if (estadoNovo) {
      const usuarioMensagem = textReceived;
      await grupos.changeWelcome(id_group, true, usuarioMensagem!);
      await sock.replyText(id_group, textMessage.grupo.bv.msgs.ligado, message);
    } else {
      await grupos.changeWelcome(id_group, false);
      await sock.replyText(id_group, textMessage.grupo.bv.msgs.desligado, message);
    }
  },
};

export default command;
