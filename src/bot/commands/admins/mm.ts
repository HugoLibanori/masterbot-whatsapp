import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "mm",
  description: "Marca todos os membros do grupo.",
  category: "admins",
  aliases: ["mm"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const {
      participants,
      dataBd: { admins },
    } = { ...grupo };
    const membrosMarcados = [];
    const usuarioTexto = textReceived;
    for (const membro of participants) {
      if (!admins.includes(membro)) {
        membrosMarcados.push(membro);
      }
    }
    if (membrosMarcados.length == 0)
      return await sock.replyText(id_chat, textMessage.grupo.mm.msgs.sem_membros, message);
    const respostaMarcar =
      usuarioTexto.length > 0
        ? criarTexto(
            textMessage.grupo.mm.msgs.resposta_motivo,
            membrosMarcados.length.toString(),
            usuarioTexto,
          )
        : criarTexto(textMessage.grupo.mm.msgs.resposta, membrosMarcados.length.toString());
    await sock.sendTextWithMentions(id_chat, respostaMarcar, membrosMarcados);
  },
};

export default command;
