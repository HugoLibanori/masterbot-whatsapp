import { proto, downloadMediaMessage } from "baileys";
import axios from "axios";
import FormData from "form-data";

import { MessageContent, Command, Bot, Resposta } from "../../../interfaces/interfaces";
import { Socket } from "../../socket/Socket.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { criarSticker } from "../../../api/sticker.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "ssf",
  description: "Cria figurinha sem fundo.",
  category: "users",
  aliases: ["ssf"],
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    try {
      const { id_chat, quotedMsg, type, contentQuotedMsg, media, command, textReceived, sender } =
        messageContent;

      const pack: string | null = await userController.getPack(sender!);
      const author: string | null = await userController.getauthor(sender!);

      const { seconds } = { ...media };

      const { author_sticker, pack_sticker } = dataBot;

      const dataMsg = {
        type: quotedMsg ? contentQuotedMsg?.type : type,
        message: quotedMsg ? (contentQuotedMsg?.message ?? message) : message,
        seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
      };

      if (dataMsg.type !== typeMessages.IMAGE) {
        await sock.sendText(id_chat, textMessage.figurinhas.ssf.msgs.erro_imagem);
        return;
      }

      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.figurinhas.ssf.msgs.espera);

      const bufferMidia = await downloadMediaMessage(dataMsg.message, "buffer", {});
      const bufferBg = await removeBg(bufferMidia);

      const { resultado: resultadoSticker } = await criarSticker(bufferBg.resultado!, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
      });

      await sock.sendSticker(id_chat, resultadoSticker);
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;

export const removeBg = async (bufferImg: Buffer): Promise<Resposta> => {
  const resposta: Resposta = {};
  try {
    const apiKey = process.env.api_removebg;
    const url = `http://127.0.0.1:5000/remove-bg`;

    const formData = new FormData();
    formData.append("image", bufferImg, "image.png");

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        "x-api-key": apiKey,
      },
      responseType: "arraybuffer",
    });

    resposta.resultado = response.data;
    return resposta;
  } catch (err: any) {
    console.log(`API removerFundo - ${err.message}`);
    resposta.erro = "Houve um erro ao remover o fundo.";
    return resposta;
  }
};
