import { proto } from "baileys";
import gis from "g-i-s";

import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto, verifiedLink } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "img",
  description: "Faz downloads de imagens.",
  category: "users",
  aliases: ["img"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: false,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, textReceived, command } = messageContent;

    const botInfo = dataBot;

    try {
      if (!args.length)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      let usuarioTexto = textReceived,
        imagensEnviadas = 0;
      await sock.replyText(id_chat, textMessage.downloads.img.espera, message);
      let { resultado: resultadoImg } = await getImage(usuarioTexto, id_chat, botInfo);

      if (!resultadoImg)
        return await sock.replyText(id_chat, textMessage.downloads.img.msgs.erro_imagem, message);

      for (let i = resultadoImg.length - 1; i >= 0; i--) {
        let imagemEscolhida = resultadoImg[i];
        await sock.replyFileUrl(typeMessages.IMAGE, id_chat, imagemEscolhida, "", message);
        resultadoImg.splice(i, 1);
        imagensEnviadas++;
      }

      if (!imagensEnviadas)
        await sock.replyText(id_chat, textMessage.downloads.img.msgs.erro_imagem, message);
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.outros.erro_api, command, err.erro),
        message,
      );
    }
  },
};

export default command;

const getImage = async (
  pesquisaTexto: string,
  id_chat: string,
  botInfo: Partial<Bot>,
  qtdFotos = 5,
): Promise<{ resultado?: string[]; erro?: string }> => {
  let resposta: { resultado?: string[]; erro?: string } = {};
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const imagens: any = await new Promise((resolve, reject) => {
          gis(pesquisaTexto, (err: any, res: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });

        if (imagens.length === 0) {
          reject({ erro: "Nenhuma imagem encontrada" });
        }

        resposta.resultado = [];

        for (let i = imagens.length - 1; i >= 0; i--) {
          if (resposta.resultado.length >= qtdFotos) break;

          const maxFotos = imagens.length > 30 ? 30 : imagens.length;
          const indexAleatorio = Math.floor(Math.random() * maxFotos);
          const statusLink = await verifiedLink(imagens[indexAleatorio].url);

          if (!statusLink || !imagens[indexAleatorio].url.endsWith(".jpg")) continue;

          resposta.resultado.push(imagens[indexAleatorio].url);
          imagens.splice(indexAleatorio, 1);
        }
        // if (id_chat === botInfo.grupo_oficial) {
        //   for (const img of resposta.resultado) {
        //     try {
        //       const bufferImg = await axios.get(img, { responseType: "arraybuffer" });
        //       const notSafe = await obterNsfw(bufferImg.data);

        //       if (notSafe) {
        //         return reject({ erro: "Conteúdo NSFW detectado" });
        //       }
        //     } catch (err) {
        //       console.log(`Erro ao verificar imagem: ${err.message}`);
        //     }
        //   }
        // }

        resolve(resposta);
      } catch (err: any) {
        console.log(`API ObterImagens - ${err.message}`);
      }
    })();
  });
};
