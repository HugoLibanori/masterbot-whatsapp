import { proto } from "baileys";
import { MessageContent, Command, Bot, User } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "usuarios",
  description: "Mostram todos os usuarios de determinado tipo.",
  category: "owner",
  aliases: ["usuarios"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    let listUsers: User[],
      userType,
      responseTitle = "",
      responseItens = "";
    if (!args.length) userType = "comum";
    else userType = textReceived.toLowerCase();
    listUsers = await userController.getUsersType(userType);
    if (!listUsers.length)
      return await sock.replyText(id_chat, textMessage.admin.usuarios.msgs.nao_encontrado, message);
    responseTitle = criarTexto(
      textMessage.admin.usuarios.msgs.resposta.titulo,
      userType,
      listUsers.length.toString(),
    );
    for (let usuario of listUsers)
      responseItens += criarTexto(
        textMessage.admin.usuarios.msgs.resposta.item,
        usuario.nome,
        usuario.id_usuario.replace("@s.whatsapp.net", ""),
        usuario.comandos_total.toString(),
      );
    const respostaFinal = responseTitle + responseItens;
    await sock.replyText(id_chat, respostaFinal, message);
  },
};

export default command;
