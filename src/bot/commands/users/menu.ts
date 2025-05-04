import { proto } from "baileys";

import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { Socket } from "../../socket/Socket.js";
import * as menu from "../../../lib/menu.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarTexto } from "../../../lib/utils.js";

const userController = new UserController();

const command: Command = {
  name: "menu",
  description: "Mostra o menu do bot.",
  category: "users",
  aliases: ["menu", "help", "ajuda"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    type TipoUsuario = "comum" | "premium" | "vip" | "dono";
    const { id_chat, pushName, isGroup, textReceived, grupo, sender } = messageContent;
    const { isAdmin } = { ...grupo };
    const dataUser = await userController.getUser(sender!);
    const totalCommands = dataUser?.comandos_total;
    const tipo = dataUser?.tipo as TipoUsuario | undefined;
    let typeUser = "";

    if (tipo && dataBot.limite_diario?.limite_tipos?.[tipo]) {
      typeUser = dataBot.limite_diario.limite_tipos[tipo].titulo ?? "";
    }

    let maxCommandsDay: string | number = "";
    if (tipo && dataBot.limite_diario?.limite_tipos?.[tipo]) {
      maxCommandsDay = dataBot.limite_diario.limite_tipos[tipo].comandos ?? "Sem limite";
    }
    const nameUser = pushName;
    let responseData = "";
    const warning = dataUser?.advertencia;

    if (dataBot.limite_diario?.status) {
      if (isGroup) {
        responseData = criarTexto(
          textMessage.info.menu.msgs.resposta_limite_diario_grupo,
          nameUser!,
          String(dataUser?.comandos_dia),
          String(maxCommandsDay),
          typeUser,
          String(totalCommands),
          String(warning),
        );
      } else {
        responseData = criarTexto(
          textMessage.info.menu.msgs.resposta_limite_diario,
          nameUser!,
          String(dataUser?.comandos_dia),
          String(maxCommandsDay),
          typeUser,
          String(totalCommands),
        );
      }
    } else {
      if (isGroup) {
        responseData = criarTexto(
          textMessage.info.menu.msgs.resposta_comum_grupo,
          nameUser!,
          typeUser,
          String(totalCommands),
          String(warning),
        );
      } else {
        responseData = criarTexto(
          textMessage.info.menu.msgs.resposta_comum,
          nameUser!,
          typeUser,
          String(totalCommands),
        );
      }
    }

    responseData += "⧖───────────────⧗\n";

    if (!args.length) {
      const responseMenu = menu.menuPrincipal(dataBot);
      await sock.sendText(id_chat, responseData + responseMenu);
      return;
    } else {
      let responseMenu = menu.menuPrincipal(dataBot);
      switch (textReceived) {
        case "1":
          responseMenu = menu.menuFigurinhas(dataBot);
          break;
        case "2":
          responseMenu = menu.menuUtilidades(dataBot);
          break;
        case "3":
          responseMenu = menu.menuDownload(dataBot);
          break;
        case "4":
          if (isGroup) responseMenu = menu.menuGrupo(isAdmin!, dataBot);
          else {
            await sock.sendText(id_chat!, textMessage.outros.permissao.grupo);
            return;
          }
          break;
        case "5":
          responseMenu = menu.menuDiversao(isGroup!, dataBot);
          break;
      }
      await sock.sendText(id_chat, responseData + responseMenu);
    }
  },
};

export default command;
