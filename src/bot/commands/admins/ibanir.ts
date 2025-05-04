import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "ibanir",
  description: "remove todos inativos do grupo.",
  category: "admins",
  aliases: ["ibanir"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo, textReceived, command } = messageContent;
    const { dataBd } = { ...grupo };
    const { number_bot } = dataBot;
    const { admins } = { ...dataBd };

    if (!args.length) return await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
    if (!textReceived || isNaN(Number(textReceived)))
      return await sock.sendText(id_chat, textMessage.grupo.ibanir.msgs.erro_qtd);

    const qtd = Number(textReceived);
    if (qtd > 50 || qtd < 1)
      return await sock.sendText(id_chat, textMessage.grupo.ibanir.msgs.limite_qtd);

    if (!dataBd.contador.status)
      return await sock.sendText(id_chat, textMessage.grupo.ibanir.msgs.erro_contador);

    const userInactive = await grupoController.getInactiveParticipants(id_chat, qtd);
    let usersBan = 0;
    if (userInactive.length) {
      for (const usuario of userInactive) {
        if (!admins.includes(usuario.id_usuario) && usuario.id_usuario != number_bot) {
          await sock.removerParticipant(id_chat, usuario.id_usuario);
          usersBan++;
        }
      }
    }
    if (usersBan)
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.grupo.ibanir.msgs.sucesso, usersBan.toString(), qtd.toString()),
        message,
      );
    else await sock.replyText(id_chat, textMessage.grupo.ibanir.msgs.sem_inativo, message);
  },
};

export default command;
