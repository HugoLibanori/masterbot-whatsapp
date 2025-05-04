import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "grupos",
  description: "Mostrar todos o grupos que o bot esta.",
  category: "owner",
  aliases: ["grupos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, numberBot } = messageContent;
    const { prefix } = dataBot;

    let currentGroups = await grupoController.getAllGroups(),
      resposta = criarTexto(
        textMessage.admin.grupos.msgs.resposta_titulo,
        currentGroups.length.toString(),
      );
    let numGrupo = 0;
    for (let grupo of currentGroups) {
      numGrupo++;
      let adminsGrupo = grupo.admins;
      let botAdmin = adminsGrupo.includes(numberBot);
      let comandoLink = botAdmin ? `${prefix}linkgrupo ${numGrupo}` : "----";
      resposta += criarTexto(
        textMessage.admin.grupos.msgs.resposta_itens,
        numGrupo.toString(),
        grupo.nome,
        grupo.participantes.length.toString(),
        adminsGrupo.length.toString(),
        botAdmin ? "Sim" : "Não",
        comandoLink,
      );
    }
    await sock.replyText(id_chat, resposta, message);
  },
};

export default command;
