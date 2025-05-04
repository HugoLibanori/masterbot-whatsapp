import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "verdados",
  description: "Mostra os dados de um membro do bot.",
  category: "owner",
  aliases: ["verdados"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      textReceived,
      quotedMsg,
      contentQuotedMsg,
      command,
      grupo: { mentionedJid },
    } = messageContent;

    const botInfo = dataBot;

    let idUser;
    if (quotedMsg) idUser = contentQuotedMsg.sender;
    else if (mentionedJid.length) idUser = mentionedJid[0];
    else if (args.length) idUser = textReceived.replace(/\W+/g, "") + "@s.whatsapp.net";
    else return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
    let registeredUser = await userController.getUser(idUser);
    if (!registeredUser)
      return await sock.replyText(id_chat, textMessage.admin.verdados.msgs.nao_registrado, message);
    let dataUser = await userController.getUser(idUser);
    if (!dataUser) return;
    let maxCommandDay = botInfo.limite_diario?.limite_tipos[dataUser.tipo].comandos ?? "Sem limite";
    let typeUser = botInfo.limite_diario?.limite_tipos[dataUser.tipo].titulo ?? "";
    let nameUser = dataUser.nome || "Ainda não obtido";
    let response = criarTexto(
      textMessage.admin.verdados.msgs.resposta_superior,
      nameUser,
      typeUser,
      dataUser.id_usuario.replace("@s.whatsapp.net", ""),
    );
    if (botInfo.limite_diario?.status)
      response += criarTexto(
        textMessage.admin.verdados.msgs.resposta_variavel.limite_diario.on,
        dataUser.comandos_dia.toString(),
        maxCommandDay.toString(),
        maxCommandDay.toString(),
      );
    response += criarTexto(
      textMessage.admin.verdados.msgs.resposta_inferior,
      dataUser.comandos_total.toString(),
    );
    await sock.replyText(id_chat, response, message);
  },
};

export default command;
