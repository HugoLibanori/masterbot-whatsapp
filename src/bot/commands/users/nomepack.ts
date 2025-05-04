import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "nomepack",
  description: "Altera o nome do pacote de figurinhas. exclusivo para cada usuário.",
  category: "users",
  aliases: ["nomepack"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, sender } = messageContent;
    try {
      if (!args.length) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }
      const usuarioTexto = textReceived.trim();
      if (usuarioTexto.length > 50) {
        await sock.sendText(id_chat, textMessage.figurinhas.nomepack.msgs.texto_longo);
        return;
      }
      await userController.updatePack(sender, usuarioTexto);
      await sock.sendText(id_chat, textMessage.figurinhas.nomepack.msgs.sucesso);
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.sendText(id_chat, criarTexto(textMessage.outros.erro_api, command, err.erro));
    }
  },
};

export default command;
