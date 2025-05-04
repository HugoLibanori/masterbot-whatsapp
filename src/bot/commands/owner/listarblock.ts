import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "listarblock",
  description: "Listar os usuários bloqueados.",
  category: "owner",
  aliases: ["listarblock"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: true,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat } = messageContent;
    const usersBlock = await sock.getBlockedContacts();
    if (usersBlock.length == 0)
      return await sock.replyText(id_chat, textMessage.admin.listarblock.msgs.lista_vazia, message);
    let resposta = criarTexto(
      textMessage.admin.listarblock.msgs.resposta_titulo,
      usersBlock.length.toString(),
    );
    for (const i of usersBlock)
      resposta += criarTexto(
        textMessage.admin.listarblock.msgs.resposta_itens,
        i.replace(/@s.whatsapp.net/g, ""),
      );
    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
