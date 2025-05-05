import {
  proto,
  getContentType,
  WASocket,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "baileys";

import { MessageContent, TextMessage, TypeMessages } from "../../interfaces/interfaces.js";
import { GrupoController } from "../../controllers/GrupoController.js";
import { getDefaultMessageContent } from "../../lib/utils.js";
import { UserController } from "../../controllers/UserController.js";

const grupoController = new GrupoController();
const userController = new UserController();

const contentMessage = async (
  sock: WASocket,
  message: proto.IWebMessageInfo,
): Promise<MessageContent> => {
  return new Promise((resolve) => {
    (async () => {
      try {
        const messageContent: MessageContent = getDefaultMessageContent();
        const msg = message.message;
        const type = getContentType(msg!);
        const numberBot = sock.user?.id.replace(/:\d+/, "");
        const numberOwner = await userController.getOwner();

        const messageKey = type as keyof proto.IMessage;
        const content = msg?.[messageKey] as {
          caption?: string;
          contextInfo?: { mentionedJid: string[] };
        };

        messageContent.textFull =
          content?.caption || msg?.conversation || msg?.extendedTextMessage?.text;

        const id_chat = message.key?.remoteJid?.replace(/:\d+/, "") ?? "";
        messageContent.id_chat = id_chat;
        messageContent.isGroup = id_chat?.includes("@g.us") ?? false;
        messageContent.numberBot = numberBot ?? "";

        if (msg) {
          messageContent.type = type;
          messageContent.quotedMsg =
            type == typeMessages.TEXTEXT &&
            msg.extendedTextMessage?.contextInfo?.quotedMessage != undefined;
          messageContent.textReceived =
            messageContent.textFull?.split(" ")?.slice(1)?.join(" ")?.trim() ?? "";
          messageContent.pushName = message.pushName;
          messageContent.sender =
            messageContent.isGroup && message.key.participant
              ? message.key?.participant?.replace(/:\d+/, "")
              : id_chat;
          messageContent.isOwnerBot = messageContent.sender === numberOwner;
          messageContent.command = messageContent.textFull?.split(" ")[0]?.toLowerCase() ?? "";
          messageContent.args = messageContent.textFull?.split(" ").slice(1) ?? [];
          messageContent.message = msg;
          messageContent.messageMedia = type !== typeMessages.TEXT || type !== typeMessages.EXTEXT;
        }

        if (messageContent.isGroup) {
          const groupInfo = (await grupoController.getGroup(id_chat)) || {
            id_grupo: "",
            nome: "",
            participantes: [],
            admins: [],
            dono: "",
            restrito_msg: false,
            mutar: false,
            bemvindo: {
              status: false,
              msg: "",
            },
            antifake: {
              status: false,
              ddi_liberados: [],
            },
            antilink: {
              status: false,
              filtros: {
                instagram: false,
                youtube: false,
                facebook: false,
              },
            },
            antiporno: false,
            antiflood: {
              status: false,
              max: 0,
              intervalo: 0,
              msgs: [],
            },
            autosticker: false,
            contador: {
              status: false,
              inicio: "",
            },
            block_cmds: [],
            lista_negra: [],
            descricao: "",
          };
          const groupMetadata = await sock.groupMetadata(id_chat!);
          const participant = groupMetadata.participants.find(
            (p) => p.id === message.key?.participant,
          );
          Object.assign(messageContent.grupo, {
            id_group: groupMetadata?.id ?? "",
            name: groupMetadata.subject ?? "",
            description: groupMetadata.desc ?? "",
            participants: groupMetadata.participants.map((p) => p.id) ?? [],
            owner: groupMetadata.owner?.replace(/:\d+/, "") ?? "",
            isBotAdmin: (() => {
              const bot = groupMetadata.participants.find((p) => p.id === numberBot);
              return bot?.admin === "admin" || bot?.admin === "superadmin";
            })(),
            isAdmin: participant?.admin === "admin" || participant?.admin === "superadmin",
            mentionedJid: content?.contextInfo?.mentionedJid ?? [],
            dataBd: groupInfo,
          });

          messageContent.grupo.dataBd = groupInfo;

          messageContent.grupo.isAdmin =
            participant?.admin === "admin" || participant?.admin === "superadmin";

          messageContent.grupo.mentionedJid = content?.contextInfo?.mentionedJid ?? [];
        }

        if (msg && messageContent.quotedMsg) {
          const contextInfo = msg.extendedTextMessage?.contextInfo;
          const quotedMessage =
            contextInfo?.quotedMessage?.viewOnceMessageV2?.message || contextInfo?.quotedMessage;
          const quotedMsgId = contextInfo?.participant || contextInfo?.remoteJid;

          if (quotedMessage && quotedMsgId) {
            messageContent.typeQuetedMessage = getContentType(quotedMessage);

            const messageKey = messageContent.typeQuetedMessage as keyof proto.IMessage;
            const seconds = quotedMessage[messageKey] as { seconds?: number };
            const mimetype = quotedMessage[messageKey] as { mimetype?: string };
            const caption = quotedMessage[messageKey] as { caption?: string };

            messageContent.contentQuotedMsg = {
              type: messageContent.typeQuetedMessage,
              body: quotedMessage?.extendedTextMessage?.text,
              sender: quotedMsgId.replace(/:\d+/, ""),
              seconds: seconds.seconds,
              message: generateWAMessageFromContent(quotedMsgId, quotedMessage, {
                userJid: messageContent.sender!,
              }),
              mimetype: mimetype.mimetype,
              caption: caption.caption,
            };
          }
        }

        if (messageContent.messageMedia) {
          const midiaMsg = msg?.[type as keyof proto.IMessage] as {
            mimetype?: string;
            url?: string;
            seconds?: string;
          };

          if (midiaMsg && typeof midiaMsg === "object" && "mimetype" in midiaMsg) {
            messageContent.media = {
              mimetype: midiaMsg.mimetype ?? "",
              mediaUrl: midiaMsg.url ?? "",
              seconds: Number(midiaMsg.seconds),
            };
          }
        }

        resolve(messageContent);
      } catch (error) {
        console.log(error);
      }
    })();
  });
};

export default contentMessage;

export const typeMessages: TypeMessages = {
  TEXT: "conversation",
  TEXTEXT: "extendedTextMessage",
  EXTEXT: "extendedTextMessage",
  IMAGE: "imageMessage",
  DOCUMENT: "documentMessage",
  VIDEO: "videoMessage",
  STICKER: "stickerMessage",
  AUDIO: "audioMessage",
};
