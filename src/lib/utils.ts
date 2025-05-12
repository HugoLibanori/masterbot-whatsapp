import readline from "readline";
import { Socket } from "../bot/socket/Socket";
import { downloadMediaMessage, proto } from "baileys";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs-extra";
import { tmpdir } from "node:os";
import crypto from "node:crypto";
import chalk from "chalk";
import moment from "moment-timezone";
import axios from "axios";
import pkg from "node-webpmux";
const { Image } = pkg;
import stream from "stream";
import sharp from "sharp";
import vision from "@google-cloud/vision";

import {
  Command,
  MessageContent,
  Bot,
  Comando,
  Grupo,
  FileExtensions,
} from "../interfaces/interfaces.js";
import { comandosInfo } from "../bot/messages/textMessage.js";
import { UserController } from "../controllers/UserController.js";
import { typeMessages } from "../bot/messages/contentMessage.js";
import * as api from "../api/sticker.js";
import { P } from "pino";

const userController = new UserController();

export const question = (question: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
};

export const onlyNumbers = (str: string) => str.replace(/\D/g, "");

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const criarTexto = (texto: string, ...params: (string | string[])[]) => {
  const flattenedParams = params.flat();

  for (let i = 0; i < flattenedParams.length; i++) {
    texto = texto.replace(`{p${i + 1}}`, flattenedParams[i]);
  }

  return texto;
};

export const runCommand = async (
  cmd: Command | undefined,
  sock: Socket,
  message: proto.IWebMessageInfo,
  messageContent: MessageContent,
  args: string[],
  dataBot: Partial<Bot>,
) => {
  if (!cmd) return;

  const textMessage = comandosInfo(dataBot);

  await cmd.exec(sock, message, messageContent, args, dataBot, textMessage);
};

export const circleMask = (
  inputPath: string,
  outputPath: string,
  maskPath = path.resolve("mascara/circle_mask.png"),
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .input(maskPath)
      .complexFilter([
        "[0:v]crop='if(gt(iw,ih),ih,iw)':'if(gt(ih,iw),iw,ih)',scale=256:256,format=rgba[video];" +
          "[1:v]scale=256:256,format=rgba[mask];" +
          "[video][mask]alphamerge",
      ])
      .outputOptions([
        "-vcodec",
        "libwebp",
        "-loop",
        "0",
        "-ss",
        "00:00:00.0",
        "-t",
        "00:00:10.0",
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0",
        "-quality",
        "50",
        "-b:v",
        "400K",
        "-compression_level",
        "6",
        "-fs",
        "1000000",
      ])
      .save(outputPath)
      .on("end", () => {
        fs.readFile(outputPath, (err, data) => {
          if (err) {
            return reject("Error reading output file");
          }
          resolve(data);
        });
      })
      .on("error", (err) => {
        console.error("Error applying mask:", err);
        reject(err);
      });
  });
};

export const getPathTemp = (ext: string) => {
  if (!fs.existsSync(path.join(tmpdir(), "lbot-api-midias")))
    fs.mkdirSync(path.join(tmpdir(), "lbot-api-midias"));
  return path.join(tmpdir(), "lbot-api-midias", `${crypto.randomBytes(20).toString("hex")}.${ext}`);
};

export const getRandomFilename = (ext: FileExtensions): string => {
  return `${Math.floor(Math.random() * 10000)}.${ext}`;
};

export const commandGuide = async (
  sock: Socket,
  dataBot: Partial<Bot>,
  commandName: string,
  cmd: Command,
) => {
  const textMessage = comandosInfo(dataBot);
  const categorias = Object.values(textMessage) as Record<
    string,
    {
      guia: string;
      descricao: string;
    }
  >[];

  for (const categoria of categorias) {
    if (cmd.aliases[0] in categoria) {
      const comando = categoria[cmd.aliases[0]];
      return textMessage.outros?.cabecalho_guia + comando.guia;
    }
  }

  return "";
};

export const removeBoldCommand = (command: string) => {
  return command.replace(/^(\*|_|~)+|(\*|_|~)+$/g, "");
};

export const commandErrorMsg = (comando: string, dataBot: Partial<Bot>) => {
  const comandos_info = comandosInfo(dataBot);
  return criarTexto(comandos_info.outros.cmd_erro, comando, comando);
};

export const corTexto = (texto: string, cor = "") => {
  return !cor ? chalk.green(texto) : chalk.hex(cor)(texto);
};

export const consoleErro = (msg: string, tipo_erro = "API") => {
  console.error(corTexto(`[${tipo_erro}]`, "#d63e3e"), msg);
};

export const checkCommandExists = async (
  botInfo: Partial<Bot>,
  command: string,
  id_usuario?: string,
): Promise<boolean | string> => {
  const ownerBot = await userController.getOwner();
  const isOwner = ownerBot === id_usuario;
  const commandsBasePath = path.resolve("src", "bot", "commands");
  if (!command || !botInfo.prefix) return false;

  const nameCommand = command.replace(botInfo.prefix, "").trim();
  const categories = ["admins", "owner", "users"];

  for (const category of categories) {
    const commandPathTs = path.join(commandsBasePath, category, `${nameCommand}.ts`);
    const commandPathJs = path.join(commandsBasePath, category, `${nameCommand}.js`);

    if (fs.existsSync(commandPathTs) || fs.existsSync(commandPathJs)) {
      if ((category === "admins" || category === "owner") && !isOwner) {
        return "protegido";
      }
      return true;
    }
  }

  return false;
};

export const ramdomDelay = (minDelayMs: number, maxDelayMs: number): Promise<void> => {
  const delayMs = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};

export const getDefaultMessageContent = (): MessageContent => {
  return {
    id_chat: "",
    command: "",
    textReceived: "",
    numberBot: "",
    sender: "",
    grupo: {
      id_group: "",
      name: "",
      description: "",
      participants: [],
      owner: "",
      isAdmin: false,
      isBotAdmin: false,
      mentionedJid: [],
      dataBd: {
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
      },
    },
    contentQuotedMsg: {
      sender: "",
    },
  };
};

export const timestampForData = (timestampMsg: number | Date) => {
  return moment(timestampMsg).format("DD/MM HH:mm:ss");
};

export const convertSecondsToMinutes = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const verifiedLink = async (url: string) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const checkExpirationDate = (inicio: string, exp: string) => {
  if (!inicio || !exp) return false;
  let partesDataHoje = inicio?.split("/");
  let dataHojeObj = new Date(
    Number(partesDataHoje[2]),
    Number(partesDataHoje[1]) - 1,
    Number(partesDataHoje[0]),
  );
  let miliDataHoje = dataHojeObj.getTime();

  let partesExpiracao = exp?.split("/");
  let expObj = new Date(
    Number(partesExpiracao[2]),
    Number(partesExpiracao[1]) - 1,
    Number(partesExpiracao[0]),
  );
  let miliExpiracao = expObj.getTime();

  return miliDataHoje > miliExpiracao;
};

export const autoSticker = async (
  sock: Socket,
  message: proto.IWebMessageInfo,
  mensagemBaileys: MessageContent,
  botInfo: Partial<Bot>,
): Promise<boolean> => {
  //Atribuição de valores
  const comandos_info = comandosInfo(botInfo);
  const { name, pack_sticker } = botInfo;
  const { id_chat, type, media, sender } = mensagemBaileys;
  const { seconds } = { ...media };
  const packSticker = await userController.getPack(sender);
  const autorSticker = await userController.getauthor(sender);

  try {
    //Verificando se é imagem ou video e fazendo o sticker automaticamente
    if (type === typeMessages.IMAGE || type === typeMessages.VIDEO) {
      if (type === typeMessages.VIDEO && seconds! > 10) return false;
      await sock.sendReact(message.key, "🕒", id_chat);
      let bufferMidia = await downloadMediaMessage(message, "buffer", {});
      if (!bufferMidia) return false;
      let { resultado: resultadoSticker } = await api.criarSticker(bufferMidia, {
        pack: packSticker ? packSticker?.trim() : pack_sticker?.trim(),
        autor: autorSticker ? autorSticker?.trim() : name?.trim(),
      });
      if (
        !resultadoSticker ||
        typeof resultadoSticker !== "object" ||
        resultadoSticker.length === 0
      ) {
        return false;
      }
      await sock.sendSticker(id_chat, resultadoSticker);
      await sock.sendReact(message.key, "✅", id_chat);
      return false;
    }
    return true;
  } catch (err: any) {
    if (!err.erro) throw err;
    await sock.replyText(
      id_chat,
      criarTexto(comandos_info.outros.erro_api, "AUTO-STICKER", err.erro),
      message,
    );
    return true;
  }
};

export const isPlataformas = async (link: string, grupo: Grupo) => {
  let isPlataforma = false;
  if (
    link.match(
      new RegExp(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/[^/\n\s]+\/|(?:youtu\.be\/))([^\s]+)/gi,
      ),
    ) &&
    grupo.antilink.filtros.youtube
  ) {
    isPlataforma = true;
  } else if (
    link.match(new RegExp(/(?:^|)(https?:\/\/www\.instagram\.com\/\w+\/[^\s]+)(?=\s|$)/gi)) &&
    grupo.antilink.filtros.instagram
  ) {
    isPlataforma = true;
  } else if (
    link.match(
      new RegExp(
        /(?:^|)(https?:\/\/www\.(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/\w+\/[^\s]+)(?=\s|$)/gi,
      ),
    ) &&
    grupo.antilink.filtros.facebook
  ) {
    isPlataforma = true;
  }

  return isPlataforma;
};

export const verificarSeWebpEhAnimado = async (buffer: Buffer) => {
  try {
    const img = new Image();
    await img.load(buffer);

    const temAnimacao = img.hasAnim;

    return temAnimacao ? "animado" : "estático";
  } catch (err) {
    console.error("Erro ao verificar o arquivo WebP:", err);
    return null;
  }
};

export const videoBufferToImageBuffer = (videoBuffer: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const videoStream = new stream.PassThrough();
    videoStream.end(videoBuffer);

    const ffmpegProcess = ffmpeg(videoStream)
      .on("error", (err) => {
        reject(err);
      })
      .outputOptions(["-vframes 1", "-f image2", "-vcodec png"])
      .format("image2pipe")
      .pipe(new stream.PassThrough(), { end: true });

    let chunks: Uint8Array<ArrayBufferLike>[] = [];
    ffmpegProcess.on("data", (chunk) => {
      chunks.push(chunk);
    });

    ffmpegProcess.on("end", async () => {
      const imageBuffer = Buffer.concat(chunks);

      // Verifique se o buffer de imagem não está vazio
      if (imageBuffer.length === 0) {
        return reject(new Error("O buffer de imagem está vazio!"));
      }

      try {
        // Agora você pode manipular a imagem com o sharp
        const processedImage = await sharp(imageBuffer)
          .resize(512, 512) // Exemplo: redimensiona para 512x512
          .toFormat("png")
          .toBuffer();

        resolve(processedImage); // Retorna o buffer da imagem processada
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const webpBufferToImageSharp = (webpBuffer: Buffer) => {
  return sharp(webpBuffer).resize(512, 512).toFormat("png").toBuffer();
};

export const obterNsfw = async (bufferImage: Buffer, botInfo: Partial<Bot>, sock: Socket) => {
  if (!botInfo.apis?.google.api_key) return false;
  const client = new vision.ImageAnnotatorClient({ apiKey: botInfo.apis?.google.api_key });
  try {
    const [result] = await client.safeSearchDetection(bufferImage);
    const detections = result.safeSearchAnnotation;
    return detections?.adult === "VERY_LIKELY";
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.data);
      throw new Error(error.response.data);
    } else {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
};

export const logComando = (
  comando: string,
  sender: string,
  grupo: string | null,
  isGroup: boolean,
) => {
  const hora = new Date().toLocaleTimeString("pt-BR");
  const data = new Date().toLocaleDateString("pt-BR");

  const remetente = sender.replace("@s.whatsapp.net", "");

  const destino = isGroup
    ? `${chalk.bold.blue("👥 GRUPO:")} ${chalk.greenBright(grupo ?? "Desconhecido")}`
    : `${chalk.bold.red("👤 PRIVADO")}`;

  console.log(
    `${chalk.gray(`[${data} ${hora}]`)} ` +
      `${chalk.bold.green("💬 COMANDO:")} ${chalk.cyan(comando.padEnd(5))} ` +
      `${chalk.bold.yellow("👤 DE:")} ${chalk.magenta(remetente.padEnd(5))} ` +
      `${destino} `,
  );
};

export const verificarVariaveisAmbiente = () => {
  const variaveisObrigatorias = [
    "DATABASE",
    "DATABASE_USERNAME",
    "DATABASE_PASSWORD",
    "DATABASE_HOST",
    "DATABASE_PORT",
  ];

  for (const variavel of variaveisObrigatorias) {
    const valor = process.env[variavel];
    if (!valor || valor === "??????") {
      console.log(
        corTexto(
          `Erro: A variável de ambiente ${variavel} não está configurada corretamente (valor: ${valor}). Preencha o arquivo .env antes de iniciar o bot.`,
          "#d63e3e",
        ),
      );
      process.exit(1);
    }
  }
  console.log("Todas as variáveis de ambiente estão configuradas corretamente.");
};

export const criacaoEnv = async () => {
  const env =
    "# CONFIGURAÇÃO PARA BANCO DE DADOS\n" +
    "DATABASE=??????\n" +
    "DATABASE_USERNAME=??????\n" +
    "DATABASE_PASSWORD=??????\n" +
    "DATABASE_HOST=??????\n" +
    "DATABASE_PORT=??????\n" +
    "DATABASE_DIALECT=mysql\n";

  await fs.writeFile(path.resolve(".env"), env, "utf-8");
  console.log(corTexto("Arquivo .env criado com sucesso.", "#00ff00"));
  console.log(
    corTexto("Configure as informações do banco de dados antes de iniciar o bot.", "#00ff00"),
  );
  process.exit(1);
};
