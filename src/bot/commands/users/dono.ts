import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "dono",
  description: "Exibe o dono do grupo.",
  category: "admins",
  aliases: ["dono"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { grupo, id_chat } = messageContent;
    const { owner } = { ...grupo };

    if (owner)
      await sock.replyWithMentions(
        id_chat,
        criarTexto(textMessage.grupo.dono.msgs.resposta, owner.replace("@s.whatsapp.net", "")),
        [owner],
        message,
      );
    else await sock.replyText(id_chat, textMessage.grupo.dono.msgs.sem_dono, message);
  },
};

export default command;
