import {
  makeWASocket,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  ConnectionState,
} from "baileys";
import NodeCache from "node-cache";
import fs from "fs-extra";
import path from "path";

import { question, onlyNumbers, verificarVariaveisAmbiente, criacaoEnv } from "./lib/utils.js";
import configWaSocket from "./configBaileys/config.js";
import { handleConnectionUpdate } from "./configBaileys/handleConnctions.js";
import handleMessages from "./bot/messages/HandleMessages.js";
import { Socket } from "./bot/socket/Socket.js";
import { Event } from "./bot/socket/Event.js";
import { BotController } from "./controllers/BotController.js";

const botController = new BotController();

import "./database/index.js";

const retryCache = new NodeCache();
const messagesCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

const connectWhatsapp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  let fullBoot = false;

  const usePairingCode = process.argv.includes("use-pairing-code");

  const sock: WASocket = makeWASocket(
    configWaSocket(state, retryCache, version, messagesCache, usePairingCode),
  );

  type SocketType = InstanceType<typeof Socket>;
  const socket: SocketType = new Socket(sock);

  const botInfo = await botController.getBotData();

  if (usePairingCode && !sock.authState.creds.registered) {
    const phoneNumber = await question("Informe o seu número de telefone: ");

    if (!phoneNumber) {
      throw new Error("Número de telefone inválido!");
    }

    if (!onlyNumbers(phoneNumber)) {
      throw new Error("Número de telefone inválido!");
    }

    const code = await sock.requestPairingCode(onlyNumbers(phoneNumber));

    console.log(`Código de pareamento: ${code}`);
  }

  sock.ev.process(async (ev) => {
    if (ev["connection.update"]) {
      fullBoot = await handleConnectionUpdate(
        ev["connection.update"],
        socket,
        botController,
        { value: fullBoot },
        connectWhatsapp,
      );
    }

    if (ev["creds.update"]) {
      await saveCreds();
    }

    if (ev["messages.upsert"]) {
      const messages = ev["messages.upsert"];
      if (!messages) return;
      const { type } = messages;
      if (type === "notify" && fullBoot) {
        messages.messages.map(async (m) => {
          if (m.key.fromMe) return;
          await handleMessages.message(socket, m);
        });
      } else if (type === "append") {
        return;
      }
    }

    if (ev["groups.upsert"]) {
      const event = new Event(socket, [], botInfo!);
      if (fullBoot) await event.adicionadoEmGrupo(socket, ev["groups.upsert"], botInfo!);
    }

    if (ev["group-participants.update"]) {
      if (!fullBoot || !botInfo) return;
      const event = ev["group-participants.update"];
      const groupInfo = await socket.getAllGroups();
      const events = new Event(socket, groupInfo, botInfo);
      if (event) {
        await events.updateParticipants(event);
      }
    }
  });
};

async function conectarBanco() {
  await import("./database/index.js");
}

// Execução principal
async function iniciarBot() {
  try {
    const existeEnv = fs.existsSync(path.resolve(".env"));
    if (!existeEnv) await criacaoEnv();

    verificarVariaveisAmbiente();

    await conectarBanco();

    await connectWhatsapp();
  } catch (err) {
    console.error("Erro durante a inicialização do bot:", err);
  }
}

iniciarBot();
