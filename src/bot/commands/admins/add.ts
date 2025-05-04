import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "add",
  description: "Adiciona usuários ao grupo.",
  category: "admins",
  aliases: ["add"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { command, textReceived, id_chat } = messageContent;
    if (!args.length)
      return await sock.sendText(messageContent.id_chat, commandErrorMsg(command, dataBot));

    const userNumber = textReceived.split(",");
    for (const numero of userNumber) {
      const numeroCompleto = numero.trim().replace(/\W+/g, "") + "@s.whatsapp.net";
      await sock
        .addParticipant(id_chat, numeroCompleto)
        .then(async (res) => {
          if (Number(res.status) != 200)
            await sock.replyText(
              id_chat,
              criarTexto(
                textMessage.grupo.add.msgs.add_erro,
                numeroCompleto.replace("@s.whatsapp.net", ""),
              ),
              message,
            );
        })
        .catch(async () => {
          await sock.replyText(
            id_chat,
            criarTexto(
              textMessage.grupo.add.msgs.numero_invalido,
              numeroCompleto.replace("@s.whatsapp.net", ""),
            ),
            message,
          );
        });
    }
  },
};

export default command;
