import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "imarcar",
  description: "Marca todos inativos do grupo.",
  category: "admins",
  aliases: ["imarcar"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo, textReceived, command } = messageContent;
    const { dataBd } = { ...grupo };
    const { name } = dataBot;

    if (!args.length) return await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
    if (!textReceived || isNaN(Number(textReceived)))
      return await sock.sendText(id_chat, textMessage.grupo.imarcar.msgs.erro_qtd);

    const qtd = Number(textReceived);
    if (qtd > 50 || qtd < 1)
      return await sock.sendText(id_chat, textMessage.grupo.imarcar.msgs.limite_qtd);

    if (!dataBd.contador.status)
      return await sock.sendText(id_chat, textMessage.grupo.imarcar.msgs.erro_contador);

    const userInactive = await grupoController.getInactiveParticipants(id_chat, qtd);
    const qtdInactive = userInactive.length;

    if (qtdInactive > 0) {
      const mentions = [];
      let respText = criarTexto(
        textMessage.grupo.imarcar.msgs.resposta_titulo,
        qtd.toString(),
        qtdInactive.toString(),
      );
      respText += `═════════════════\n╠\n`;
      for (const usuario of userInactive) {
        respText += criarTexto(
          textMessage.grupo.imarcar.msgs.resposta_itens,
          usuario.id_usuario.replace(/@s.whatsapp.net/g, ""),
          usuario.msg.toString(),
        );
        mentions.push(usuario.id_usuario);
      }
      respText += `╠\n╚═〘 ${name?.trim()}® 〙`;
      await sock.sendTextWithMentions(id_chat, respText, mentions);
    } else {
      await sock.sendText(id_chat, textMessage.grupo.imarcar.msgs.sem_inativo);
    }
  },
};

export default command;
