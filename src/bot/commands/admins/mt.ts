import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "mt",
  description: "Marca todos os membros e administradores do grupo.",
  category: "admins",
  aliases: ["mt"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, textReceived, grupo } = messageContent;
    const { participants } = { ...grupo };
    const usuarioTexto = textReceived;
    const respostaMarcar =
      usuarioTexto.length > 0
        ? criarTexto(
            textMessage.grupo.mt.msgs.resposta_motivo,
            participants.length.toString(),
            usuarioTexto,
          )
        : criarTexto(textMessage.grupo.mt.msgs.resposta, participants.length.toString());
    await sock.sendTextWithMentions(id_chat, respostaMarcar, participants);
  },
};

export default command;
