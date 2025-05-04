import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../interfaces/interfaces.js";
import { Socket } from "../socket/Socket.js";
import { comandosInfo } from "./textMessage.js";

export const checkPermission = async (
  sock: Socket,
  message: proto.IWebMessageInfo,
  cmd: Command,
  messageContent: MessageContent,
  dataBot: Partial<Bot>,
) => {
  const text = comandosInfo(dataBot);
  const jid = message.key.remoteJid;
  const { grupo, isGroup, isOwnerBot } = messageContent;
  const { isAdmin, isBotAdmin } = grupo || {};
  const { owner, admin, group, isBotAdmin: cmdBotAdmin } = cmd;

  // Regras comuns a grupo e privado
  if (owner && !isOwnerBot) {
    if (jid) await sock.sendText(jid, text.outros.permissao.apenas_dono_bot);
    return false;
  }

  if (isGroup) {
    if (admin && !isAdmin) {
      if (jid) await sock.sendText(jid, text.outros.permissao.apenas_admin);
      return false;
    }
    if (cmdBotAdmin && !isBotAdmin) {
      if (jid) await sock.sendText(jid, text.outros.permissao.bot_admin);
      return false;
    }
  } else {
    if (group || admin) {
      if (jid) await sock.sendText(jid, text.outros.permissao.grupo);
      return false;
    }
  }

  return true;
};
