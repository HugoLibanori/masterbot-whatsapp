import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "anti-porno",
  description: "Ativa e desativa o anti-porno do grupo.",
  category: "admins",
  aliases: ["aporno", "ap", "antiporno"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    const estadoNovo = !dataBd.antiporno;
    await grupos.changeAntiPorno(id_group, estadoNovo);
    const resposta = estadoNovo
      ? textMessage.grupo.aporno.msgs.ligado
      : textMessage.grupo.aporno.msgs.desligado;

    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
