import { Socket } from "../bot/socket/Socket.js";
import moment from "moment-timezone";

import Bot from "../database/models/Bot.js";
import { Bot as IBot } from "../interfaces/interfaces.js";
import { checkCommandExists, corTexto, criarTexto } from "../lib/utils.js";
import { comandosInfo } from "../bot/messages/textMessage.js";
import { UserController } from "./UserController.js";

export class BotController {
  async registerBotData(sock?: Socket) {
    try {
      const [bot, created] = await Bot.findOrCreate({
        where: { id: 1 },
        defaults: {
          started: new Date(),
          number_bot: (await sock?.getNumberBot()) ?? "SEM NÚMERO DO BOT",
          name: "M@ste® Bot",
          name_admin: "Hugo",
          author_sticker: "M@ste® Bot",
          pack_sticker: "M@ste® Bot Stickers",
          prefix: "!",
          executed_cmds: 0,
          autosticker: false,
          block_cmds: [],
          limite_diario: {
            status: false,
            expiracao: 0,
            limite_tipos: {
              comum: {
                titulo: "👤 Comum",
                comandos: 50,
              },
              premium: {
                titulo: "🌟 Premium",
                comandos: 100,
              },
              vip: {
                titulo: "🎖️ VIP",
                comandos: null,
              },
              dono: {
                titulo: "💻 Dono",
                comandos: null,
              },
            },
          },
          commands_pv: true,
          command_rate: {
            status: false,
            max_cmds_minute: 10,
            block_time: 5,
          },
          apis: {
            google: {
              api_key: "",
            },
            simi: {
              api_key: "",
            },
          },
        },
      });

      console.log(
        created
          ? "[BOT] - " + corTexto("✓ Bot configurado pela primeira vez!")
          : "[BOT] - " + corTexto("✓ Bot já configurado."),
      );
      return bot;
    } catch (error) {
      console.error("Erro ao registrar dados do bot:", error);
      throw error;
    }
  }

  async getBotData(): Promise<Partial<IBot> | null> {
    try {
      const bot = await Bot.findOne({ where: { id: 1 } });

      if (!bot) return null;

      const plain = bot.get({ plain: true });

      return plain as Partial<IBot>;
    } catch (error) {
      console.error("Erro ao obter dados do bot:", error);
      throw error;
    }
  }

  async updateBotData(data: Partial<IBot>) {
    try {
      const bot = await Bot.findOne({ where: { id: 1 } });
      if (!bot) {
        await this.registerBotData();
        throw new Error("Bot not found");
      }

      const currentData = bot.get({ plain: true });
      const newData = { ...currentData, ...data };

      if (newData.started && typeof newData.started === "number") {
        newData.started = new Date(newData.started);
      }

      await bot.update(newData);

      return bot;
    } catch (error) {
      console.error("Erro ao atualizar dados do bot:", error);
      throw error;
    }
  }

  async startBot(socket: Socket, botInfo: Partial<IBot>) {
    try {
      const bot = botInfo;
      bot.started = moment().tz("America/Sao_Paulo").toDate();
      bot.number_bot = await socket.getNumberBot();
      await this.updateBotData(bot);
      console.log("[BOT]", corTexto(comandosInfo(bot).outros.dados_bot));
    } catch (err: any) {
      err.message = `botStart - ${err.message}`;
      throw err;
    }
  }

  async blockCommandsGlobal(
    comandos: string[],
    dataBot: Partial<IBot>,
    id_usuario: string,
  ): Promise<string> {
    const botInfo = dataBot;
    if (!botInfo || !dataBot.prefix) return "";

    const existingCommands = botInfo.block_cmds || [];
    const newCommands: string[] = [];
    const textCommands = comandosInfo(dataBot);
    let respText = textCommands.grupo.bcmd.msgs.resposta_titulo;

    for (const comando of comandos) {
      if (!comando.startsWith(dataBot.prefix)) {
        respText += criarTexto(
          textCommands.admin.bcmdglobal.msgs.resposta_variavel.enviado_erro,
          comando,
        );
        continue;
      }
      const exists = checkCommandExists(dataBot, comando, id_usuario);

      if (!exists) {
        respText += criarTexto(
          textCommands.admin.bcmdglobal.msgs.resposta_variavel.nao_existe,
          comando,
        );
      } else {
        if (existingCommands.includes(comando)) {
          respText += criarTexto(
            textCommands.admin.bcmdglobal.msgs.resposta_variavel.ja_bloqueado,
            comando,
          );
        } else if (comando.includes("menu") || typeof exists === "string") {
          respText += criarTexto(
            textCommands.admin.bcmdglobal.msgs.resposta_variavel.erro,
            comando,
          );
        } else {
          respText += criarTexto(
            textCommands.admin.bcmdglobal.msgs.resposta_variavel.bloqueado_sucesso,
            comando,
          );
          newCommands.push(comando);
        }
      }
    }

    const novos = [...new Set([...existingCommands, ...newCommands])];
    await Bot.update({ block_cmds: novos }, { where: { id: 1 } });

    return respText;
  }

  async unblockCommandsGlobal(comandos: string[], dataBot: Partial<IBot>): Promise<string> {
    const botInfo = dataBot;
    if (!botInfo || !dataBot.prefix) return "";

    const existingCommands = botInfo.block_cmds || [];
    const updatedCommands = [...existingCommands];
    const textCommands = comandosInfo(dataBot);
    let respText = textCommands.admin.dcmdglobal.msgs.resposta_titulo;

    for (const comando of comandos) {
      if (!comando.startsWith(dataBot.prefix)) {
        respText += criarTexto(
          textCommands.admin.dcmdglobal.msgs.resposta_variavel.enviado_erro,
          comando,
        );
        continue;
      }

      if (!existingCommands.includes(comando)) {
        respText += criarTexto(
          textCommands.admin.dcmdglobal.msgs.resposta_variavel.ja_desbloqueado,
          comando,
        );
      } else {
        // Remove da lista
        const index = updatedCommands.indexOf(comando);
        if (index !== -1) updatedCommands.splice(index, 1);

        respText += criarTexto(
          textCommands.admin.dcmdglobal.msgs.resposta_variavel.desbloqueado_sucesso,
          comando,
        );
      }
    }

    await Bot.update({ block_cmds: updatedCommands }, { where: { id: 1 } });

    return respText;
  }

  async changeDailyLimit(status: boolean, botInfo: Partial<IBot>) {
    const bot = botInfo;
    const timestamp_atual = Math.round(new Date().getTime() / 1000);
    if (!bot.limite_diario) return;
    bot.limite_diario.expiracao = status ? timestamp_atual + 86400 : 0;
    bot.limite_diario.status = status;
    await this.updateBotData(bot);
  }

  async changeLimiter(botInfo: Partial<IBot>, status = true, cmds_minuto = 5, tempo_bloqueio = 60) {
    let bot = botInfo;
    if (!bot.command_rate) return;
    bot.command_rate.status = status;
    bot.command_rate.max_cmds_minute = cmds_minuto;
    bot.command_rate.block_time = tempo_bloqueio;
    bot.command_rate.user = [];
    bot.command_rate.user_limit = [];
    await this.updateBotData(bot);
  }

  async changeBotName(nome: string, botInfo: Partial<IBot>) {
    let bot = botInfo;
    bot.name = nome;
    await this.updateBotData(bot);
  }

  async changeAdmName(nome: string, botInfo: Partial<IBot>) {
    let bot = botInfo;
    bot.name_admin = nome;
    await this.updateBotData(bot);
  }

  async changeStickerName(nome: string, botInfo: Partial<IBot>) {
    let bot = botInfo;
    bot.pack_sticker = nome;
    await this.updateBotData(bot);
  }

  async addUserType(botInfo: Partial<IBot>, tipo: string, titulo: string, comandos: number | null) {
    let bot = botInfo;
    if (!bot.limite_diario) return false;
    let tiposAtuais = Object.keys(bot.limite_diario.limite_tipos);
    let tipoInserido = tipo.toLowerCase().replaceAll(" ", "");
    if (tiposAtuais.includes(tipoInserido)) return false;
    const tipos = bot.limite_diario.limite_tipos;
    comandos = comandos === -1 ? null : comandos;
    tipos[tipoInserido] = {
      titulo,
      comandos: Number(comandos),
    };
    await this.updateBotData(bot);
    return true;
  }

  async removeUserType(botInfo: Partial<IBot>, tipo: string) {
    const tiposNaoRemoviveis = ["comum", "dono"];
    let bot = botInfo;
    if (!bot.limite_diario) return false;
    let tiposAtuais = Object.keys(bot.limite_diario.limite_tipos);
    let tipoInserido = tipo.toLowerCase().replaceAll(" ", "");
    if (!tiposAtuais.includes(tipoInserido)) return false;
    if (tiposNaoRemoviveis.includes(tipoInserido)) return false;
    delete bot.limite_diario.limite_tipos[tipoInserido];
    await this.updateBotData(bot);
    return true;
  }

  async changeTitleUserType(botInfo: Partial<IBot>, tipo: string, titulo: string) {
    let bot = botInfo;
    if (!bot.limite_diario) return false;
    let tiposAtuais = Object.keys(bot.limite_diario.limite_tipos);
    let tipoInserido = tipo.toLowerCase().replaceAll(" ", "");
    if (!tiposAtuais.includes(tipoInserido)) return false;
    bot.limite_diario.limite_tipos[tipoInserido].titulo = titulo;
    await this.updateBotData(bot);
    return true;
  }

  async changeUserTypeCommands(tipo: string, comandos: number | null, botInfo: Partial<IBot>) {
    let bot = botInfo;
    if (!bot.limite_diario) return false;
    let tiposAtuais = Object.keys(bot.limite_diario.limite_tipos);
    comandos = comandos == -1 ? null : comandos;
    if (!tiposAtuais.includes(tipo)) return false;
    bot.limite_diario.limite_tipos[tipo].comandos = comandos;
    await this.updateBotData(bot);
    return true;
  }

  async changeGrupoOficial(id_Group: string) {
    const dadosAtuais = await Bot.findOne({ where: { id: 1 } });

    if (dadosAtuais?.get({ plain: true })) {
      const dadosAtualizados = { ...dadosAtuais?.get({ plain: true }), grupo_oficial: id_Group };

      await Bot.update(dadosAtualizados, { where: { id: 1 } });
    }
  }

  async verificarComandosBloqueadosGlobal(
    comando: string,
    botInfo: Partial<IBot>,
  ): Promise<boolean | undefined> {
    return botInfo.block_cmds?.includes(comando);
  }

  async verificarExpiracaoLimite(botInfo: Partial<IBot>) {
    let bot = botInfo;
    if (!bot.limite_diario) return;
    let timestamp_atual = Math.round(new Date().getTime() / 1000);
    if (timestamp_atual >= bot.limite_diario.expiracao) {
      await new UserController().resetCommandsDay();
      bot.limite_diario.expiracao = timestamp_atual + 86400;
      await this.updateBotData(bot);
    }
  }

  async atualizarComandos() {
    let bot = await this.getBotData();

    if (bot) {
      bot.executed_cmds = (bot.executed_cmds || 0) + 1;

      await this.updateBotData(bot);
    } else {
      console.error("Bot não encontrado no banco de dados.");
    }
  }

  async addApikey(nameApi: string, apikey: string, botInfo: Partial<IBot>) {
    const bot = botInfo;

    if (!bot.apis) {
      bot.apis = { google: { api_key: apikey }, simi: { api_key: apikey } };
    }

    if (!bot.apis[nameApi as keyof typeof bot.apis]) {
      bot.apis[nameApi as keyof typeof bot.apis] = { api_key: apikey };
    } else {
      bot.apis[nameApi as keyof typeof bot.apis].api_key = apikey;
    }

    await this.updateBotData(bot);
  }

  async checkLimitCommand(
    usuario_id: string,
    tipo_usuario: string,
    isAdmin: boolean,
    botInfo: Partial<IBot>,
  ): Promise<{ comando_bloqueado: boolean; msg: string }> {
    let bot = botInfo;
    let resposta: { comando_bloqueado: boolean; msg: string } = {
      comando_bloqueado: false,
      msg: "",
    };
    const timestamp_atual = Math.round(new Date().getTime() / 1000);
    const comandos_info = comandosInfo(bot);

    if (!bot.command_rate) {
      resposta.comando_bloqueado = false;
      return resposta;
    }

    const userLimitArray = Array.from(bot.command_rate.user_limit.values());

    //VERIFICA OS USUARIOS LIMITADOS QUE JÁ ESTÃO EXPIRADOS E REMOVE ELES DA LISTA
    for (let i = 0; i < userLimitArray.length; i++) {
      if (userLimitArray[i].horario_liberacao <= timestamp_atual)
        bot.command_rate.user_limit.splice(i, 1);
    }

    //VERIFICA OS USUARIOS QUE JÁ ESTÃO COM COMANDO EXPIRADOS NO ULTIMO MINUTO
    for (let i = 0; i < bot.command_rate.user.length; i++) {
      if (bot.command_rate.user[i].expiracao <= timestamp_atual) bot.command_rate.user.splice(i, 1);
    }

    //SE NÃO FOR UM USUARIO DO TIPO DONO OU FOR ADMINISTRADOR DO GRUPO , NÃO FAÇA A CONTAGEM.
    if (tipo_usuario == "dono" || isAdmin) {
      resposta.comando_bloqueado = false;
    } else {
      //VERIFICA SE O USUARIO ESTÁ LIMITADO
      let usuarioIndexLimitado = bot.command_rate.user_limit.findIndex(
        (usuario) => usuario.usuario_id == usuario_id,
      );
      if (usuarioIndexLimitado != -1) {
        resposta = {
          comando_bloqueado: true,
          msg: criarTexto(
            comandos_info.admin.taxacomandos.msgs.resposta_usuario_limitado,
            bot.command_rate.block_time.toString(),
          ),
        };
      } else {
        //OBTEM O INDICE DO USUARIO NA LISTA DE USUARIOS
        let usuarioIndex = bot.command_rate.user.findIndex(
          (usuario) => usuario.usuario_id == usuario_id,
        );
        //VERIFICA SE O USUARIO ESTÁ NA LISTA DE USUARIOS
        if (usuarioIndex != -1) {
          bot.command_rate.user[usuarioIndex].cmds++; //ADICIONA A CONTAGEM DE COMANDOS ATUAIS
          if (bot.command_rate.user[usuarioIndex].cmds >= bot.command_rate.max_cmds_minute + 1) {
            //SE ATINGIR A QUANTIDADE MAXIMA DE COMANDOS POR MINUTO
            //ADICIONA A LISTA DE USUARIOS LIMITADOS
            bot.command_rate.user_limit.push({
              usuario_id,
              horario_liberacao: timestamp_atual + bot.command_rate.block_time,
            });
            bot.command_rate.user.splice(usuarioIndex, 1);
            resposta = {
              comando_bloqueado: true,
              msg: criarTexto(
                comandos_info.admin.taxacomandos.msgs.resposta_usuario_limitado,
                bot.command_rate.block_time.toString(),
              ),
            };
          } else {
            //SE NÃO ATINGIU A QUANTIDADE MÁXIMA DE COMANDOS
            resposta.comando_bloqueado = false;
          }
        } else {
          //SE NÃO EXISTIR NA LISTA
          bot.command_rate.user.push({
            usuario_id,
            cmds: 1,
            expiracao: timestamp_atual + 60,
          });
          resposta.comando_bloqueado = false;
        }
      }
    }

    await this.updateBotData(bot); //ATUALIZA OS DADOS NO ARQUIVO E RETORNO
    return resposta;
  }
}
