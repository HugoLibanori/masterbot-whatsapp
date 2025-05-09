import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "adms",
  description: "Marca todos os administradores do grupo.",
  category: "admins",
  aliases: ["adms"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo, textReceived, quotedMsg, contentQuotedMsg } = messageContent;
    const { dataBd } = { ...grupo };
    const { admins } = dataBd;

    const textUser = textReceived;
    let respAdms = criarTexto(
      textMessage.grupo.adms.msgs.resposta_titulo,
      admins.length.toString(),
    );

    if (textUser.length > 0) respAdms += criarTexto(textMessage.grupo.adms.msgs.mensagem, textUser);
    for (const adm of admins) {
      respAdms += criarTexto(
        textMessage.grupo.adms.msgs.resposta_itens,
        adm.replace(/@s.whatsapp.net/g, ""),
      );
    }
    const mensagemAlvo = quotedMsg ? contentQuotedMsg?.message : message;
    await sock.replyWithMentions(id_chat, respAdms, admins, mensagemAlvo);
  },
};

export default command;
