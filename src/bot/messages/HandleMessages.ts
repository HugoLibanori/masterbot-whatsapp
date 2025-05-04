import { proto } from "baileys";

import contentMessage from "./contentMessage.js";
import { checkingMessage } from "./checkingMessage.js";
import { BotController } from "../../controllers/BotController.js";
import { Socket } from "../socket/Socket.js";
import { checkingSendMessage } from "../../middleware/checkingSendMessage.js";
import { GrupoController } from "../../controllers/GrupoController.js";

const grupoController = new GrupoController();

class HandleMessages {
  private botController: BotController;
  constructor() {
    this.botController = new BotController();
  }
  public async message(sock: Socket, message: proto.IWebMessageInfo) {
    const messageContent = await contentMessage(await sock.getInstance(), message);

    const dataBot = await this.botController.getBotData();

    if (!(await grupoController.filterAntiLink(sock, messageContent, dataBot!, message))) return;
    if (!(await grupoController.filterAntiPorno(sock, messageContent, dataBot!, message))) return;
    if (!(await grupoController.filtroAntiFlood(sock, messageContent, dataBot!))) return;
    if (!(await checkingSendMessage(sock, message, messageContent, dataBot!))) return;
    if (!(await grupoController.jogoDaVelha(sock, messageContent, dataBot!))) return;
    await checkingMessage(sock, message, messageContent, dataBot!);
  }
}

export default new HandleMessages();
