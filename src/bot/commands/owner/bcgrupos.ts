import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "bcgrupos",
  description: "Manda uma mensagem broadcast para todos os grupo que o bot estiver.",
  category: "owner",
  aliases: ["bcgrupos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, textReceived, command } = messageContent;

    const botInfo = dataBot;

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
    let announcementMessage = textReceived,
      Currentgroups = await grupoController.getAllGroups();
    await sock.replyText(
      id_chat,
      criarTexto(
        textMessage.admin.bcgrupos.msgs.espera,
        Currentgroups.length.toString(),
        Currentgroups.length.toString(),
      ),
      message,
    );
    for (let grupo of Currentgroups) {
      if (!grupo.restrito_msg) {
        await new Promise((resolve) => {
          setTimeout(async () => {
            await sock.sendText(
              grupo.id_grupo,
              criarTexto(textMessage.admin.bcgrupos.msgs.anuncio, announcementMessage),
            );
            resolve({});
          }, 1000);
        });
      }
    }
    await sock.replyText(id_chat, textMessage.admin.bcgrupos.msgs.bc_sucesso, message);
  },
};

export default command;
