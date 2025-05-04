import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "linkgrupo",
  description: "Envia o link de um grupo que o bot esta e é ADM.",
  category: "owner",
  aliases: ["linkgrupo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: true,
  isBotAdmin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, textReceived, numberBot } = messageContent;

    let gruposAtuais = await grupoController.getAllGroups();
    let indexGrupo = Number(textReceived);
    if (isNaN(indexGrupo))
      return await sock.replyText(
        id_chat,
        textMessage.admin.linkgrupo.msgs.nao_encontrado,
        message,
      );
    indexGrupo = indexGrupo - 1;
    if (!gruposAtuais[indexGrupo])
      return await sock.replyText(
        id_chat,
        textMessage.admin.linkgrupo.msgs.nao_encontrado,
        message,
      );
    let botAdmin = gruposAtuais[indexGrupo].admins.includes(numberBot);
    if (!botAdmin)
      return await sock.replyText(id_chat, textMessage.admin.linkgrupo.msgs.nao_admin, message);
    let link = await sock.getLinkGroup(gruposAtuais[indexGrupo].id_grupo);
    if (link)
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.admin.linkgrupo.msgs.resposta, link),
        message,
      );
  },
};

export default command;
