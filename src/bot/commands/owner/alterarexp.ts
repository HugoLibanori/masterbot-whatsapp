import { proto } from "baileys";
import { MessageContent, Command, Bot, GrupoVerificado } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { checkExpirationDate, commandErrorMsg } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "alteraexp",
  description: "ALtera a expiração do grupo verificado.",
  category: "owner",
  aliases: ["alterarexp"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      let idLink = groupLink.replace(/(https:\/\/chat.whatsapp.com\/)/gi, "");
      let infoGrupo = await sock.groupGetInviteInfo(idLink);
      let infoExp = await grupos.getGroupExpiration(infoGrupo.id);

      console.log("INFOEXPIRAÇÂO:", infoExp?.expiracao);

      if (!infoExp)
        return await sock.replyText(id_chat, textMessage.admin.alterarexp.msgs.sem_grupo, message);

      let currentMonth = new Date().getMonth() + 1;
      const mesesComTrintaDias = [4, 6, 9, 11];
      if (infoExp?.expiracao !== null) {
        if (infoExp?.expiracao?.split("/")[1] > currentMonth.toString())
          currentMonth = Number(infoExp.expiracao.split("/")[1]);
      }

      const trintaDias = mesesComTrintaDias.includes(currentMonth);
      let day = trintaDias ? 30 : 31;
      let linkValido = groupLink.match(/(https:\/\/chat.whatsapp.com)/gi);
      if (!linkValido)
        return await sock.replyText(
          id_chat,
          textMessage.admin.entrargrupo.msgs.link_invalido,
          message,
        );
      let currentdate = new Date();

      const groupVerified = await grupos.groupVerified(infoGrupo.id);

      if (!groupVerified)
        return await sock.replyText(id_chat, textMessage.admin.alterarexp.msgs.sem_grupo, message);

      let expirado;
      if (infoExp.expiracao !== null) {
        expirado = checkExpirationDate(currentdate.toLocaleDateString("pt-br"), infoExp.expiracao);
      }

      if (infoExp.expiracao === null || expirado) {
        infoExp.expiracao = currentdate.toLocaleDateString("pt-br");
      }

      let partesInfoGrupo = infoExp.expiracao.split("/");

      let data = new Date(
        Number(partesInfoGrupo[2]),
        Number(partesInfoGrupo[1]) - 1,
        Number(partesInfoGrupo[0]),
      );

      data.setDate(data.getDate() + day);
      let expiracao = data.toLocaleDateString("pt-br");

      const dadosGrupoVerificado: GrupoVerificado = {
        id_grupo: infoGrupo.id,
        nome: infoGrupo.subject,
        inicio: groupVerified.inicio,
        expiracao,
      };

      await grupos.updateExpirationGroup(dadosGrupoVerificado);

      await sock.replyText(id_chat, textMessage.admin.alterarexp.msgs.sucesso, message);
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;
