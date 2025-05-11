import { proto } from "baileys";

import { Socket } from "../bot/socket/Socket";
import { comandosInfo } from "../bot/messages/textMessage";

export interface MessageContent {
  textFull?: string | null;
  numberBot: string;
  id_chat: string;
  id_group?: string | null;
  isGroup?: boolean;
  sender: string;
  type?: string | null;
  typeQuetedMessage?: string;
  quotedMsg?: boolean;
  textReceived: string;
  pushName?: string | null;
  isOwnerBot?: boolean;
  command: string;
  message?: proto.IMessage | null;
  messageMedia?: boolean;
  args?: string[];
  mimetype?: string;
  contentQuotedMsg: {
    type?: string | undefined;
    body?: string | null | undefined;
    sender: string;
    message?: proto.WebMessageInfo;
    seconds?: number;
    mimetype?: string;
    caption?: string;
  };
  media?: {
    mimetype?: string;
    mediaUrl?: string;
    seconds?: number;
  };
  grupo: {
    id_group: string;
    name: string;
    description: string;
    participants: string[];
    owner: string;
    isAdmin: boolean;
    isBotAdmin: boolean;
    mentionedJid: string[];
    dataBd: Grupo;
  };
}

export type CommandReturn =
  | void
  | string
  | boolean
  | Buffer
  | proto.WebMessageInfo
  | Record<string, any>; // se quiser permitir objetos também

export interface Command {
  name: string;
  description: string;
  category: string;
  aliases: string[];
  group?: boolean;
  admin?: boolean;
  owner?: boolean;
  isBotAdmin?: boolean;
  exec: (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage: ReturnType<typeof comandosInfo>,
  ) => Promise<CommandReturn>;
}

export interface Bot {
  started: Date;
  number_bot: string;
  name: string;
  name_admin: string;
  author_sticker: string;
  pack_sticker: string;
  prefix: string;
  executed_cmds: number;
  autosticker: boolean;
  block_cmds: string[];
  limite_diario: {
    status: boolean;
    expiracao: number;
    limite_tipos: {
      comum: {
        titulo: string;
        comandos: number;
      };
      premium: {
        titulo: string;
        comandos: number;
      };
      vip: {
        titulo: string;
        comandos: null;
      };
      dono: {
        titulo: string;
        comandos: null;
      };
      [key: string]: {
        titulo: string;
        comandos: number | null;
      };
    };
  };
  commands_pv: boolean;
  command_rate: {
    status: boolean;
    max_cmds_minute: number;
    block_time: number;
    user: string[];
    user_limit: string[];
  };
  grupo_oficial: string | null;
  apis: {
    google: {
      api_key: string;
    };
  };
}

export interface TextMessage {
  guia: string;
  msgs: {
    sucesso: string;
    cmd_erro?: string;
  };
}

export interface Comando {
  descricao: string;
  guia: string;
  msgs: Mensagens;
}

type CategoriaComandos = Record<string, Comando>;

export interface Comandos {
  info: CategoriaComandos;
  utilidades: CategoriaComandos;
  figurinhas: CategoriaComandos;
  diversao: CategoriaComandos;
  downloads: CategoriaComandos;
  grupo: CategoriaComandos;
  admin: CategoriaComandos;
  outros: CategoriaComandos;
}

export interface User {
  id_usuario: string;
  nome: string;
  comandos_total: number;
  comandos_dia: number;
  tipo: string;
  advertencia: number;
  pack: string | null;
  autor: string | null;
}

export interface TypeMessages {
  TEXT: string;
  TEXTEXT: string;
  EXTEXT: string;
  IMAGE: string;
  DOCUMENT: string;
  VIDEO: string;
  STICKER: string;
  AUDIO: string;
}

interface Mensagens {
  [key: string]: string | string[] | Mensagens | ((...args: any[]) => string);
}

export type TextoComandos = Record<
  string,
  Record<
    string,
    {
      guia: string;
      descricao: string;
      msgs?: Mensagens;
    }
  >
>;

export interface Resposta {
  resultado?: Buffer<ArrayBufferLike>;
  erro?: string;
}

export interface Grupo {
  id_grupo: string;
  nome: string;
  participantes: string[];
  admins: string[];
  dono: string;
  restrito_msg: boolean;
  mutar: boolean;
  bemvindo: {
    status: boolean;
    msg: string;
  };
  antifake: {
    status: boolean;
    ddi_liberados: string[];
  };
  antilink: {
    status: boolean;
    filtros: {
      instagram: boolean;
      youtube: boolean;
      facebook: boolean;
    };
  };
  antiporno: boolean;
  antiflood?: {
    status: boolean;
    max: number;
    intervalo: number;
    msgs: string[];
  };
  autosticker?: boolean;
  contador: {
    status: boolean;
    inicio: string;
  };
  block_cmds: string[];
  lista_negra: string[];
  descricao: string;
}

export interface ContadorInte {
  msg: number;
  imagem: number;
  audio: number;
  sticker: number;
  video: number;
  outro: number;
  texto: number;
}

export interface DataGrupoInitial {
  id_grupo: string;
  nome: string;
  descricao: string;
  participantes: string[];
  admins: string[];
  dono: string;
  restrito_msg: boolean;
}

export interface GrupoVerificado {
  id_grupo: string;
  nome: string;
  inicio: string;
  expiracao: string | null;
}

export type FileExtensions = "mp3" | "mp4" | "webp" | "png" | "jpg" | "gif" | "zip";
