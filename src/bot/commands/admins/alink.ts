import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "alink",
  description: "Ativa ou desativa o anti-link do grupo",
  category: "admins",
  aliases: ["alink", "al", "antilink"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { dataBd, id_group } = { ...grupo };
    const objPlataforma = {
      instagram: false,
      youtube: false,
      facebook: false,
    };
    if (args)
      args?.forEach((plataforma) => {
        const key = plataforma.toLowerCase();
        if (key in objPlataforma) objPlataforma[key as keyof typeof objPlataforma] = true;
      });

    const estadoNovo = !dataBd.antilink.status;
    await grupos.changeAntiLink(id_group, estadoNovo, objPlataforma);
    const resposta = estadoNovo
      ? textMessage.grupo.alink.msgs.ligado
      : textMessage.grupo.alink.msgs.desligado;

    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
