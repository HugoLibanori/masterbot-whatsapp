import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const grupos = new GrupoController();

const command: Command = {
  name: "dcmd",
  description: "Desbloqueia um ou vários comandos no grupo.",
  category: "admins",
  aliases: ["dcmd"],
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
    const { id_chat, grupo, command, textReceived } = messageContent;
    const { id_group: id_grupo, dataBd } = { ...grupo };

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);

    const comandosParaDesbloquear = textReceived.split(" ").map((x) => x.trim());
    const respostaDesbloqueio = await grupos.unblockCommands(
      id_grupo,
      comandosParaDesbloquear,
      dataBot,
    );

    if (respostaDesbloqueio) {
      await sock.replyText(id_chat, respostaDesbloqueio, message);
    }
  },
};

export default command;
