import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "tipos",
  description: "Mostra todos os tipos ativos.",
  category: "owner",
  aliases: ["tipos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat } = messageContent;

    const botInfo = dataBot;

    let limite_tipos = botInfo.limite_diario?.limite_tipos;
    if (!limite_tipos) return;
    let tipos = Object.keys(limite_tipos);
    let respostaTitulo = criarTexto(
      textMessage.admin.tipos.msgs.resposta.titulo,
      tipos.length.toString(),
    );
    let respostaItens = "";
    for (let tipo of tipos) {
      let usuariosTipo = await userController.getUsersType(tipo);
      respostaItens += criarTexto(
        textMessage.admin.tipos.msgs.resposta.item,
        tipo,
        limite_tipos[tipo].titulo,
        limite_tipos[tipo].comandos?.toString() || "∞",
        usuariosTipo.length.toString(),
      );
    }
    const respostaFinal = respostaTitulo + respostaItens;
    await sock.replyText(id_chat, respostaFinal, message);
  },
};

export default command;
