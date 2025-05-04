import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "contador",
  description: "Ativa e desativa o contador do grupo.",
  category: "admins",
  aliases: ["contador"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, grupo } = messageContent;
    const { id_group, dataBd } = { ...grupo };

    const newState = !dataBd.contador.status;
    const participants = dataBd.participantes;

    await grupos.changeContador(id_group, newState);

    if (newState) {
      await grupos.recordGroupCount(id_group, participants);
    } else {
      await grupos.removeCountGroup(id_group);
    }
    const response = newState
      ? textMessage.grupo.contador.msgs.ligado
      : textMessage.grupo.contador.msgs.desligado;
    await sock.replyText(id_chat, response, message);
  },
};

export default command;
