import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "autosticker",
  description: "Ativa e desativa o autosticker do grupo.",
  category: "admins",
  aliases: ["autosticker"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    const estadoNovo = !dataBd.autosticker;
    await grupos.changeAutoSticker(id_group, estadoNovo);
    const resposta = estadoNovo
      ? textMessage.grupo.autosticker.msgs.ligado
      : textMessage.grupo.autosticker.msgs.desligado;
    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
