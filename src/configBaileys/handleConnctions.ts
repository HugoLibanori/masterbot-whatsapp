import { ConnectionState, DisconnectReason } from "baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { BotController } from "../controllers/BotController.js";
import { Event } from "../bot/socket/Event.js";
import { Socket } from "../bot/socket/Socket.js";
import qrcode from "qrcode-terminal";

import { comandosInfo } from "../bot/messages/textMessage.js";
import { Bot } from "../interfaces/interfaces.js";
import { criarTexto } from "../lib/utils.js";

const handleConnectionClose = async (
  conn: Partial<ConnectionState>,
  botInfo?: Partial<Bot>,
): Promise<boolean> => {
  const textCommands = comandosInfo();
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
    } else if (erroCode === DisconnectReason?.restartRequired) {
      console.log(textCommands.outros.desconectado.reiniciar);
      reconectar = true;
    } else if (erroCode !== undefined) {
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
  const { connection, qr } = connectionState;

  if (qr) {
    console.log(qrcode.generate(qr, { small: true }));
  }

  if (connection === "open") {
    let botInfo = await botController.getBotData();

    if (!botInfo) {
      await botController.registerBotData(socket);
      console.log("BOT REGISTRADO COM SUCESSO. REINICIANDO CONEXÃO...");
      await socket.restartBot();
      return false;
    }

    const groupInfo = await socket.getAllGroups();
    const events = new Event(socket, groupInfo, botInfo);
    fullBootRef.value = await events.updateDataStart();
    return fullBootRef.value;
  }

  if (connection === "close") {
    const shouldReconnect = await handleConnectionClose(connectionState);
    if (shouldReconnect) {
      try {
        await reconnectCallback();
      } catch (err) {
        console.error("Erro ao tentar reconectar:", err);
      }

      return false;
    }
    return true;
  }

  return true;
}
