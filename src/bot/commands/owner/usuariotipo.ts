import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "usuariotipo",
  description: "Converte um usuário para o tipo enviado.",
  category: "owner",
  aliases: ["usuariotipo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const {
      id_chat,
      command,
      textReceived,
      quotedMsg,
      contentQuotedMsg,
      grupo: { mentionedJid },
    } = messageContent;

    let botInfo = dataBot;
    const numberOwner = await userController.getOwner();

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
    let [userType, changedUser] = args;
    if (quotedMsg) changedUser = contentQuotedMsg.sender;
    else if (mentionedJid.length === 1) changedUser = mentionedJid[0];
    else if (args.length === 2) changedUser = changedUser.replace(/\W+/g, "") + "@s.whatsapp.net";
    else return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
    if (numberOwner === changedUser)
      return await sock.replyText(id_chat, textMessage.admin.usuariotipo.msgs.tipo_dono, message);
    let c_registrado = await userController.getUser(changedUser);
    if (c_registrado) {
      let alterou = await userController.alterarTipoUsuario(
        changedUser,
        userType.toLowerCase(),
        botInfo,
      );
      if (!alterou)
        return await sock.replyText(
          id_chat,
          textMessage.admin.usuariotipo.msgs.tipo_invalido,
          message,
        );
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.admin.usuariotipo.msgs.sucesso, userType.toUpperCase()),
        message,
      );
    } else {
      await sock.replyText(id_chat, textMessage.admin.usuariotipo.msgs.nao_registrado, message);
    }
  },
};

export default command;
