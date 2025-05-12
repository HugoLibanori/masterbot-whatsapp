import { proto } from "baileys";

import { checkPermission } from "./checkPermission.js";
import commands from "../commands/index.js";
import { MessageContent, Bot } from "../../interfaces/interfaces.js";
import { escapeRegex, runCommand, commandGuide, autoSticker, logComando } from "../../lib/utils.js";
import { Socket } from "../socket/Socket.js";
import { typeMessages } from "./contentMessage.js";

export const checkingMessage = async (
  sock: Socket,
  message: proto.IWebMessageInfo,
  messageContent: MessageContent,
  dataBot: Partial<Bot>,
) => {
  const {
    textFull,
    id_chat,
    command,
    args,
    type,
    grupo: {
      dataBd: { autosticker },
      name: group_name,
    },
    isGroup,
    pushName,
  } = messageContent;

  const prefix = dataBot.prefix;
  const autostickerpv =
    !isGroup && (type === typeMessages.IMAGE || type === typeMessages.VIDEO) && dataBot.autosticker;
  const autostickergp =
    isGroup && (type === typeMessages.IMAGE || type === typeMessages.VIDEO) && autosticker;

  if (autostickerpv || autostickergp) {
    if (!(await autoSticker(sock, message, messageContent, dataBot))) return;
  }

  if (!textFull || !prefix || !command || !args) return;

  if (!command.startsWith(prefix)) return;

  const commandName = command.toLowerCase().replace(new RegExp("^" + escapeRegex(prefix)), "");

  const cmd = Array.from(commands.values()).find((c) => c.aliases.includes(commandName));

  if (!cmd) return;

  const permission = await checkPermission(sock, message, cmd, messageContent, dataBot);

  if (!permission) return;

  const msgGuide = !args.length ? false : args[0].toLocaleLowerCase() === "guia";

  if (msgGuide) {
    const guide = await commandGuide(sock, dataBot, commandName, cmd);
    await sock.sendText(id_chat!, guide);
    return;
  }

  logComando(command, pushName ?? "Desconhecido", group_name, isGroup!);

  await runCommand(cmd, sock, message, messageContent, args, dataBot);
};
