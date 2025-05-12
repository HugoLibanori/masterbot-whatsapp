import { proto } from "baileys";

import { Socket } from "../bot/socket/Socket.js";
import { Bot, MessageContent } from "../interfaces/interfaces.js";
import { UserController } from "../controllers/UserController.js";
import { GrupoController } from "../controllers/GrupoController.js";
import { BotController } from "../controllers/BotController.js";
import { comandosInfo } from "../bot/messages/textMessage.js";
import { criarTexto, checkCommandExists, checkExpirationDate } from "../lib/utils.js";

const userController = new UserController();
const grupoController = new GrupoController();
const botController = new BotController();

export const checkingSendMessage = async (
  sock: Socket,
  message: proto.IWebMessageInfo,
  messageContent: MessageContent,
  dataBot: Partial<Bot>,
): Promise<boolean> => {
  const { sender, pushName, command, isGroup, grupo, type, id_chat, isOwnerBot, textReceived } =
    messageContent;
  const { dataBd, id_group, isAdmin, isBotAdmin } = { ...grupo };
  const { prefix } = dataBot;

  const commandsInfo = comandosInfo(dataBot);
  const numberOwner = await userController.getOwner();
  const existCommands = await checkCommandExists(dataBot, command);
  const usersBlock = await sock.getBlockedContacts();
  const userBlock = usersBlock.includes(sender!);
  const msgGuia = textReceived === "guia";

  try {
    //SE O PV DO BOT NÃO ESTIVER LIBERADO
    if (!isGroup && !isOwnerBot && !dataBot.commands_pv) return false;

    // VERIFICANDO SE O USUARIO EXISTE E SE NÃO EXISTIR FAÇA O CADASTRO.
    const userRegister = await userController.getUser(sender!);
    if (!userRegister) {
      if (!pushName || !sender) return false;
      await userController.registerUser(sender, pushName);
    }

    // SE NÃO HOUVER UM USUARIO DO TIPO 'DONO' E O COMANDO FOR !ADMIN, ALTERE O TIPO DE QUEM FEZ O COMANDO COMO DONO.
    if ((!numberOwner || numberOwner === "Sem dono") && command === `${prefix}admin`) {
      await userController.registerOwner(sender);
      await sock.replyText(id_chat, commandsInfo.outros.dono_cadastrado, message);
      return false;
    }

    //SE O CONTADOR TIVER ATIVADO E FOR UMA MENSAGEM DE GRUPO, VERIFICA SE O USUARIO EXISTE NO CONTADOR , REGISTRA ELE E ADICIONA A CONTAGEM
    if (isGroup && dataBd?.contador?.status) {
      if (!sender || !id_group || !type) return false;
      await grupoController.checkRegisterCountParticipant(id_group, sender);
      await grupoController.addParticipantCount(id_group, sender, type);
    }

    // VERIFICANDO SE O GRUPO É PERMITIDO
    if (existCommands && isGroup && sender !== numberOwner) {
      let grupoVerificado = await grupoController.groupVerified(id_group);
      let dataAtual = new Date().toLocaleDateString("pt-br");
      let expirado = checkExpirationDate(dataAtual, grupoVerificado?.expiracao ?? "");
      if (!grupoVerificado && id_group !== dataBot?.grupo_oficial) {
        await sock.replyText(
          id_group,
          criarTexto(
            commandsInfo.grupo.permissao.descricao,
            numberOwner.replace("@s.whatsapp.net", ""),
          ),
          message,
        );
        return false;
      } else if (expirado) {
        await sock.replyText(
          id_group,
          criarTexto(
            commandsInfo.grupo.permissao.descricao_expirado,
            numberOwner.replace("@s.whatsapp.net", ""),
          ),
          message,
        );
        return false;
      }
    }

    // VERIFICANDO SE O USUARIO ESTA NO GRUPO OFICIAL DO BOT
    if (!isGroup) {
      const grupoEmComum = await grupoController.obterGrupoEmComum(dataBot.grupo_oficial!, sender);
      if (!grupoEmComum && sender !== numberOwner) {
        let linkConvite = dataBot.grupo_oficial
          ? await sock.getLinkGroup(dataBot.grupo_oficial)
          : "[❗] Sem grupo oficial.";
        await sock.sendLinkWithPrevia(
          id_chat,
          criarTexto(
            commandsInfo.grupo.permissao.grupo_comum,
            linkConvite!,
            numberOwner.replace("@s.whatsapp.net", ""),
            "https://www.facebook.com/profile.php?id=61569409066442",
          ),
          linkConvite!,
        );
        return false;
      }
    }

    // VERIFICANDO SE O USUARIO JA TEM 3 ADVERTENCIAS E EXPULSANDO
    let advertencias = await userController?.getUserWarning(sender);
    if (isGroup && advertencias === 3 && !isAdmin) {
      await sock.removerParticipant(id_group, sender);
      await userController.resetWarn(sender);
      return false;
    }

    // OBTENDO DADOS ATUALIZADOS DO USUÁRIO
    const dataUser = await userController.getUser(sender);

    //SE O CONTADOR TIVER ATIVADO E FOR UMA MENSAGEM DE GRUPO, VERIFICA SE O USUARIO EXISTE NO CONTADOR , REGISTRA ELE E ADICIONA A CONTAGEM
    if (isGroup && dataBd?.contador.status) {
      await grupoController.verificarRegistrarContagemParticipante(id_group, sender);
      await grupoController.addParticipantCount(id_group, sender, type!);
    }

    //SE FOR BLOQUEADO RETORNE
    if (userBlock) return false;
    //SE O GRUPO ESTIVER COM O RECURSO 'MUTADO' LIGADO E USUARIO NÃO FOR ADMINISTRADOR
    if (isGroup && !isAdmin && dataBd?.mutar) return false;
    //SE FOR MENSAGEM DE GRUPO, O BOT NÃO FOR ADMIN E ESTIVER COM RESTRIÇÃO DE MENSAGENS PARA ADMINS
    if (isGroup && !isBotAdmin && dataBd?.restrito_msg) return false;

    //ENVIE QUE LEU A MENSAGEM
    await sock.readMessage(id_chat, sender, message.key);
    //ATUALIZE NOME DO USUÁRIO
    await userController.updateName(sender, pushName ?? "Sem nome!");

    if (existCommands) {
      if (dataBot?.command_rate?.status) {
        let limiteComando = await botController.checkLimitCommand(
          sender,
          dataUser?.tipo ?? "comum",
          isAdmin,
          dataBot,
        );
        if (limiteComando.comando_bloqueado) {
          if (limiteComando.msg != undefined)
            await sock.replyText(id_chat, limiteComando.msg, message);
          return false;
        }
      }
      //BLOQUEIO GLOBAL DE COMANDOS
      if (
        (await botController.verificarComandosBloqueadosGlobal(command, dataBot)) &&
        !isOwnerBot
      ) {
        await sock.replyText(
          id_chat,
          criarTexto(commandsInfo.admin.bcmdglobal.msgs.resposta_cmd_bloqueado, command),
          message,
        );
        return false;
      }
      //SE FOR MENSAGEM DE GRUPO , COMANDO ESTIVER BLOQUEADO E O USUARIO NAO FOR ADMINISTRADOR DO GRUPO
      if (
        isGroup &&
        (await grupoController.verificarComandosBloqueadosGrupo(command, grupo)) &&
        !isAdmin
      ) {
        await sock.replyText(
          id_chat,
          criarTexto(commandsInfo.grupo.bcmd.msgs.resposta_cmd_bloqueado, command),
          message,
        );
        return false;
      }
      //SE O RECURSO DE LIMITADOR DIARIO DE COMANDOS ESTIVER ATIVADO E O COMANDO NÃO ESTIVER NA LISTA DE EXCEÇÔES/INFO/GRUPO/ADMIN
      if (dataBot.limite_diario?.status) {
        await botController.verificarExpiracaoLimite(dataBot);
        if ((await checkCommandExists(dataBot, command)) && !msgGuia) {
          let ultrapassou = await userController.verificarUltrapassouLimiteComandos(
            sender,
            dataBot,
          );
          if (!ultrapassou) {
            await userController.addContagemDiaria(sender);
          } else {
            await sock.replyText(
              id_chat,
              criarTexto(
                commandsInfo.admin.limitediario.msgs.resposta_excedeu_limite,
                pushName ?? "Sem nome!",
                numberOwner.replace("@s.whatsapp.net", ""),
              ),
              message,
            );
            return false;
          }
        } else {
          await userController.addContagemTotal(sender);
        }
      } else {
        await userController.addContagemTotal(sender);
      }
      //ADICIONA A CONTAGEM DE COMANDOS EXECUTADOS PELO BOT
      await botController.atualizarComandos();
    }

    return true;
  } catch (error) {
    return false;
  }
};
