import { proto } from "baileys";
import { MessageContent, Command, Bot, GrupoVerificado } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "addgrupo",
  description: "Adiciona um grupo para liberar o bot.",
  category: "owner",
  aliases: ["addgrupo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command, textReceived } = messageContent;

    const botInfo = dataBot;

    try {
      if (!args.length)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      let groupLink = textReceived;
      let validLink = groupLink.match(/(https:\/\/chat.whatsapp.com)/gi);
      if (!validLink)
        return await sock.replyText(
          id_chat,
          textMessage.admin.entrargrupo.msgs.link_invalido,
          message,
        );
      let idLink = groupLink.replace(/(https:\/\/chat.whatsapp.com\/)/gi, "");

      await sock
        .groupGetInviteInfo(idLink)
        .then(async (infoGrupo) => {
          let data = new Date();
          let dataHoje = data.toLocaleDateString("pt-br");

          const dadosGrupoVerificado: GrupoVerificado = {
            id_grupo: infoGrupo.id,
            nome: infoGrupo.subject,
            inicio: dataHoje,
            expiracao: null,
          };

          await grupoController.registerGroupVerified(dadosGrupoVerificado);

          await sock.replyText(id_chat, textMessage.admin.addgrupo.msgs.sucesso, message);
        })
        .catch(async (erro: any) => {
          console.log(erro);
          await sock.replyText(id_chat, textMessage.admin.addgrupo.msgs.privado, message);
          return;
        });
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;
