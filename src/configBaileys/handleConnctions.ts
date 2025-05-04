import { ConnectionState, DisconnectReason } from "baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { BotController } from "../controllers/BotController.js";
import { Event } from "../bot/socket/Event.js";
import { Socket } from "../bot/socket/Socket.js";

import { comandosInfo } from "../bot/messages/textMessage.js";
import { Bot } from "../interfaces/interfaces.js";

const handleConnectionClose = async (
  conn: Partial<ConnectionState>,
  botInfo: Partial<Bot>,
): Promise<boolean> => {
  const textCommands = comandosInfo(botInfo);
  try {
    const { lastDisconnect } = conn;
    let reconectar = false;
    if (!lastDisconnect) {
      return reconectar;
    }
    const erroCode = new Boom(lastDisconnect.error)?.output?.statusCode;
    if (erroCode === DisconnectReason?.loggedOut) {
      console.log(textCommands.outros.desconectado.deslogado);
      fs.rmSync("./session", { recursive: true, force: true });
      reconectar = true;
    } else if (erroCode == DisconnectReason?.restartRequired) {
      console.log(textCommands.outros.desconectado.reiniciar);
      reconectar = true;
    } else if (erroCode == DisconnectReason?.connectionClosed) {
      console.log(textCommands.outros.desconectado.desconect);
      reconectar = true;
    } else if (erroCode === DisconnectReason.timedOut) {
      reconectar = true;
    } else if (erroCode === DisconnectReason?.unavailableService) {
      reconectar = true;
    }
    return reconectar;
  } catch (error) {
    console.error("Erro ao tratar a conexão:", error);
    return false;
  }
};

export async function handleConnectionUpdate(
  connectionState: Partial<ConnectionState>,
  socket: Socket,
  botController: BotController,
  fullBootRef: { value: boolean },
  reconnectCallback: () => Promise<void>,
): Promise<boolean> {
  const { connection } = connectionState;

  if (connection === "open") {
    let botInfo = await botController.getBotData();

    if (!botInfo) {
      await botController.registerBotData(socket);
      console.log("BOT REGISTRADO COM SUCESSO. REINICIANDO CONEXÃO...");
      await reconnectCallback();
      return true;
    }

    const groupInfo = await socket.getAllGroups();
    const events = new Event(socket, groupInfo, botInfo);
    fullBootRef.value = await events.updateDataStart();
    return fullBootRef.value;
  }

  if (connection === "close") {
    const botInfo = await botController.getBotData();
    if (!botInfo) return true;

    const shouldReconnect = await handleConnectionClose(connectionState, botInfo);
    if (shouldReconnect) {
      console.log("Tentando reconectar...");
      await reconnectCallback();
    }
    return true;
  }

  return true;
}
