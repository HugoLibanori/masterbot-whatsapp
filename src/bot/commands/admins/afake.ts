import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "afake",
  description: "Ativa e desativa o anti-fake do grupo.",
  category: "admins",
  aliases: ["afake", "af", "antifake"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    const estadoNovo = !dataBd.antifake.status;
    const DDIAutorizados = !args.length ? ["55"] : args;
    await grupos.changeAntiFake(id_grupo, estadoNovo, DDIAutorizados);

    const resposta = estadoNovo
      ? textMessage.grupo.afake.msgs.ligado
      : textMessage.grupo.afake.msgs.desligado;

    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
