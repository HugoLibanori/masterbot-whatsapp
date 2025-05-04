import { GroupMetadata, WASocket, proto, WAUrlInfo } from "baileys";
import pino from "pino";

import * as api from "../../api/downloads.js";

const pinoLogger = pino({ level: "silent" });

import { typeMessages } from "../messages/contentMessage.js";
import { ramdomDelay } from "../../lib/utils.js";

export class Socket {
  private sock: WASocket;

  constructor(sock: WASocket) {
    this.sock = sock;
  }

  async sendText(chatId: string, texto: string): Promise<proto.WebMessageInfo | undefined> {
    await this.updatePresence(chatId, "composing");
    return await this.sock.sendMessage(chatId, {
      text: texto,
      linkPreview: null,
    });
  }

  async restartBot(): Promise<void> {
    await this.sock.ws.close();
  }

  async sendReact(messageId: proto.IMessageKey, emoji: string, chat_id: string): Promise<void> {
    await this.sock.sendMessage(chat_id, { react: { text: emoji, key: messageId } });
  }

  async sendListReply(chatId: string, texto: string): Promise<proto.WebMessageInfo | undefined> {
    await this.updatePresence(chatId, "composing");
    return await this.sock.sendMessage(chatId, {
      listReply: {
        title: "Teste de Lista",
      },
      linkPreview: null,
    });
  }

  async updatePresence(
    chatId: string,
    status: "composing" | "recording" | "paused",
  ): Promise<void> {
    await this.sock.presenceSubscribe(chatId);
    await ramdomDelay(200, 400);
    await this.sock.sendPresenceUpdate(status, chatId);
    await ramdomDelay(300, 1000);
    await this.sock.sendPresenceUpdate("paused", chatId);
  }

  async SendImage(
    chatId: string,
    buffer: Buffer,
    legenda?: string,
  ): Promise<proto.WebMessageInfo | undefined> {
    await this.updatePresence(chatId, "composing");
    return await this.sock.sendMessage(chatId, {
      image: buffer,
      caption: legenda || "",
    });
  }

  async sendSticker(chatId: string, buffer: Buffer): Promise<proto.WebMessageInfo | undefined> {
    return await this.sock.sendMessage(chatId, {
      sticker: buffer,
    });
  }

  async getInstance(): Promise<WASocket> {
    return this.sock;
  }

  async getAllGroups() {
    const groups = await this.sock.groupFetchAllParticipating();
    const groupsInfo = [];
    for (const [key, value] of Object.entries(groups)) {
      groupsInfo.push(value);
    }
    return groupsInfo;
  }

  async getMembersGroupMetadata(grupoMetadata: GroupMetadata) {
    const { participants } = grupoMetadata;
    const participantes: string[] = [];
    participants.forEach((participant) => {
      participantes.push(participant.id);
    });
    return participantes;
  }

  async getAdminsGroupMetadata(grupoMetadata: GroupMetadata) {
    const { participants } = grupoMetadata;
    const grupoAdmins = participants.filter((member) => member.admin != null);
    const admins: string[] = [];
    grupoAdmins.forEach((admin) => {
      admins.push(admin.id);
    });
    return admins;
  }

  async getImagePerfil(id_chat: string) {
    return await this.sock.profilePictureUrl(id_chat, "image");
  }

  async replyFileUrl(
    tipo: string,
    id_chat: string,
    url: string,
    legenda: string,
    mensagemCitacao: proto.IWebMessageInfo,
    mimetype = "",
  ) {
    if (tipo == typeMessages.IMAGE) {
      await this.sock.sendMessage(
        id_chat,
        { image: { url }, caption: legenda },
        { quoted: mensagemCitacao },
      );
      return;
    } else if (tipo == typeMessages.VIDEO) {
      // const base64Thumb = (await api.Videos.obterThumbnailVideo(url, "url")).resultado;
      await this.sock.sendMessage(
        id_chat,
        {
          video: { url },
          mimetype,
          caption: legenda,
          // jpegThumbnail: base64Thumb,
        },
        { quoted: mensagemCitacao },
      );
      return;
    } else if (tipo == typeMessages.AUDIO) {
      await this.sock.sendMessage(
        id_chat,
        { audio: { url }, mimetype },
        { quoted: mensagemCitacao },
      );
      return;
    }
  }

  async replyFileBuffer(
    tipo: string,
    id_chat: string,
    buffer: Buffer,
    legenda: string,
    mensagemCitacao: proto.IWebMessageInfo,
    mimetype = "",
  ): Promise<proto.WebMessageInfo | undefined> {
    if (tipo == typeMessages.VIDEO) {
      let base64Thumb = (await api.obterThumbnailVideo(buffer, "buffer")).resultado;
      return await this.sock.sendMessage(
        id_chat,
        { video: buffer, caption: legenda, mimetype, jpegThumbnail: base64Thumb },
        { quoted: mensagemCitacao },
      );
    } else if (tipo == typeMessages.IMAGE) {
      return await this.sock.sendMessage(
        id_chat,
        { image: buffer, caption: legenda },
        { quoted: mensagemCitacao },
      );
    } else if (tipo == typeMessages.AUDIO) {
      return await this.sock.sendMessage(
        id_chat,
        { audio: buffer, mimetype },
        { quoted: mensagemCitacao },
      );
    }
    return;
  }

  async replyText(id_chat: string, texto: string, mensagemCitacao: proto.IWebMessageInfo) {
    await this.updatePresence(id_chat, "composing");
    return await this.sock.sendMessage(
      id_chat,
      {
        text: texto,
        linkPreview: null,
      },
      { quoted: mensagemCitacao },
    );
  }

  async replyWithMentions(
    id_chat: string,
    text: string,
    mentions: string[],
    quoted: proto.IWebMessageInfo | proto.WebMessageInfo | undefined,
  ) {
    await this.updatePresence(id_chat, "composing");
    return await this.sock.sendMessage(id_chat, { text, mentions }, { quoted });
  }

  async changeProfilePhoto(id_chat: string, bufferImagem: Buffer) {
    return await this.sock.updateProfilePicture(id_chat, bufferImagem);
  }

  async removerParticipant(id_grupo: string, participante: string) {
    const resposta = await this.sock.groupParticipantsUpdate(id_grupo, [participante], "remove");
    return resposta[0];
  }

  async getNumberBot(): Promise<string> {
    if (!this.sock.user?.id) {
      return "";
    }
    return this.sock.user?.id.replace(/:\d+/, "");
  }

  async sendTextWithMentions(id_chat: string, texto: string, mencionados: string[]) {
    await this.updatePresence(id_chat, "composing");
    return await this.sock.sendMessage(id_chat, { text: texto, mentions: mencionados });
  }

  async revokeLinkGroup(id_grupo: string) {
    return await this.sock.groupRevokeInvite(id_grupo);
  }

  async getLinkGroup(id_grupo: string) {
    const codigoConvite = await this.sock.groupInviteCode(id_grupo);
    return codigoConvite ? `https://chat.whatsapp.com/${codigoConvite}` : undefined;
  }

  async sendLinkWithPrevia(id_chat: string, texto: string, linkGroup: string) {
    await this.updatePresence(id_chat, "composing");

    const linkPreview: WAUrlInfo = {
      title: "Link do Grupo",
      "canonical-url": linkGroup,
      "matched-text": linkGroup,
    };

    return await this.sock.sendMessage(id_chat, {
      text: texto,
      linkPreview,
    });
  }

  async demoteParticipant(id_grupo: string, participante: string) {
    const resposta = await this.sock.groupParticipantsUpdate(id_grupo, [participante], "demote");
    return resposta[0];
  }

  async promoteParticipant(id_grupo: string, participante: string) {
    const resposta = await this.sock.groupParticipantsUpdate(id_grupo, [participante], "promote");
    return resposta[0];
  }

  async addParticipant(id_grupo: string, participante: string) {
    const resposta = await this.sock.groupParticipantsUpdate(id_grupo, [participante], "add");
    return resposta[0];
  }
  async pinOrUnpinText(id_chat: string, mensagemCitacao: proto.IWebMessageInfo, fixar = false) {
    const type = !fixar ? 1 : 2;

    const objKey = {
      remoteJid: id_chat,
      fromMe: false,
      id: mensagemCitacao.message?.extendedTextMessage?.contextInfo?.stanzaId,
      participant: mensagemCitacao.message?.extendedTextMessage?.contextInfo?.participant,
    };
    return await this.sock.sendMessage(id_chat, {
      pin: objKey,
      type,
    });
  }

  async deleteMessage(mensagem: proto.IWebMessageInfo, mensagemCitada = false) {
    let messageDeleted;
    if (mensagemCitada) {
      messageDeleted = {
        remoteJid: mensagem.key.remoteJid,
        fromMe: false,
        id: mensagem.message?.extendedTextMessage?.contextInfo?.stanzaId,
        participant: mensagem.message?.extendedTextMessage?.contextInfo?.participant,
      };
    } else {
      messageDeleted = mensagem.key;
    }
    return await this.sock.sendMessage(mensagem.key.remoteJid!, {
      delete: messageDeleted,
    });
  }

  async changeGroupRestriction(id_grupo: string, status: boolean) {
    const config = status ? "announcement" : "not_announcement";
    return await this.sock.groupSettingUpdate(id_grupo, config);
  }

  async getBlockedContacts() {
    return await this.sock.fetchBlocklist();
  }

  async joinLinkGroup(idLink: string) {
    return await this.sock.groupAcceptInvite(idLink);
  }

  async groupLeave(id_grupo: string) {
    return await this.sock.groupLeave(id_grupo);
  }

  async blockContact(id_usuario: string) {
    return await this.sock.updateBlockStatus(id_usuario, "block");
  }

  async unblockContact(id_usuario: string) {
    return await this.sock.updateBlockStatus(id_usuario, "unblock");
  }

  async groupGetInviteInfo(link: string): Promise<GroupMetadata> {
    return await this.sock.groupGetInviteInfo(link);
  }

  async readMessage(id_chat: string, remetente: string, id_msg: proto.IMessageKey) {
    return await this.sock.readMessages([id_msg]);
  }

  async sendTextWithImageMentions(
    id_chat: string,
    texto: string,
    mencionados: string[],
    url: string,
  ) {
    await this.updatePresence(id_chat, "composing");
    return await this.sock.sendMessage(id_chat, {
      caption: texto,
      mentions: mencionados,
      image: { url },
    });
  }
}
