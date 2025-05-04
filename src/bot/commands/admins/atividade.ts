import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "atividade",
  description: "Mostra atividades de um membro do grupo.",
  category: "admins",
  aliases: ["atividade"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo, command, quotedMsg, contentQuotedMsg } = messageContent;
    const { dataBd, mentionedJid } = { ...grupo };

    if (!dataBd.contador.status)
      return await sock.sendText(id_chat, textMessage.grupo.atividade.msgs.erro_contador);
    let userActivity;

    if (quotedMsg) {
      if (!contentQuotedMsg?.sender) return;
      userActivity = await grupoController.getUserActivity(id_chat, contentQuotedMsg?.sender);
      if (!userActivity)
        return await sock.replyText(id_chat, textMessage.grupo.atividade.msgs.fora_grupo, message);
    } else if (mentionedJid?.length === 1) {
      userActivity = await grupoController.getUserActivity(id_chat, mentionedJid[0]);
      if (!userActivity)
        return await sock.replyText(id_chat, textMessage.grupo.atividade.msgs.fora_grupo, message);
    } else {
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    }
    const respActivity = criarTexto(
      textMessage.grupo.atividade.msgs.resposta,
      userActivity.msg.toString(),
      userActivity.texto.toString(),
      userActivity.imagem.toString(),
      userActivity.video.toString(),
      userActivity.sticker.toString(),
      userActivity.audio.toString(),
      userActivity.outro.toString(),
    );
    await sock.replyText(id_chat, respActivity, message);
  },
};

export default command;
