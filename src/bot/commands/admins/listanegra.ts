import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "listanegra",
  description: "Mostra a lista negra do grupo.",
  category: "admins",
  aliases: ["listanegra", "ln", "listblack"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { dataBd } = { ...grupo };
    const { lista_negra } = dataBd;
    let resposta_listanegra;

    resposta_listanegra = textMessage.grupo.listanegra.msgs.resposta_titulo;
    if (lista_negra.length == 0)
      return await sock.replyText(id_chat, textMessage.grupo.listanegra.msgs.lista_vazia, message);
    for (const usuario_lista of lista_negra) {
      resposta_listanegra += criarTexto(
        textMessage.grupo.listanegra.msgs.resposta_itens,
        usuario_lista.replace(/@s.whatsapp.net/g, ""),
      );
    }
    resposta_listanegra += `╠\n╚═〘 ${dataBot.name?.trim()}®〙`;
    await sock.sendText(id_chat, resposta_listanegra);
  },
};

export default command;
