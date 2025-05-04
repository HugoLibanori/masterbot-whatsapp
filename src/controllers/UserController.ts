import Users from "../database/models/User.js";
import Sequelize from "sequelize";

import { User } from "../interfaces/interfaces.js";
import Bot from "../database/models/Bot.js";

export class UserController {
  async registerUser(sender: string, pushName: string) {
    const user: User = {
      id_usuario: sender,
      nome: pushName,
      comandos_total: 0,
      comandos_dia: 0,
      tipo: "comum",
      advertencia: 0,
      pack: null,
      autor: null,
    };
    return await Users.create(user);
  }

  async getUser(id: string) {
    const user = await Users.findOne({ where: { id_usuario: id } });
    return user?.get({ plain: true });
  }

  async getOwner(): Promise<string> {
    const owner = await Users.findOne({ where: { tipo: "dono" } });
    if (!owner) {
      return "Sem dono";
    }
    return owner.get({ plain: true }).id_usuario;
  }

  async getPack(id_usuario: string): Promise<string | null> {
    const pack = await Users.findOne({ where: { id_usuario } });
    if (!pack) {
      return null;
    }
    return pack.get({ plain: true }).pack;
  }

  async updatePack(id_usuario: string, texto: string): Promise<string | null> {
    const pack = await Users.findOne({ where: { id_usuario } });
    if (!pack) {
      return null;
    }
    await pack.update({ pack: texto });
    return pack.get({ plain: true }).pack;
  }

  async getauthor(id_usuario: string): Promise<string | null> {
    const author = await Users.findOne({ where: { id_usuario } });
    if (!author) {
      return null;
    }
    return author.get({ plain: true }).autor;
  }

  async updateauthor(id_usuario: string, texto: string): Promise<string | null> {
    const autor = await Users.findOne({ where: { id_usuario } });
    if (!autor) {
      return null;
    }
    await autor.update({ autor: texto });
    return autor.get({ plain: true }).autor;
  }

  async changeWarning(id_usuario: string, advertencia: number) {
    const user = await Users.findOne({ where: { id_usuario } });
    if (!user) return;

    await Users.update({ advertencia: user.advertencia + advertencia }, { where: { id_usuario } });
  }

  async getUserWarning(id_usuario: string): Promise<number> {
    const advertencia = await Users.findOne({ where: { id_usuario } });
    if (!advertencia) return 0;
    return advertencia.get({ plain: true }).advertencia;
  }

  async resetWarn(id_usuario: string) {
    await Users.update({ advertencia: 0 }, { where: { id_usuario } });
  }

  async resetOwner() {
    await Users.update({ tipo: "comum" }, { where: { tipo: "dono" } });
  }

  async updateOwner(id_usuario: string) {
    await Users.update({ tipo: "dono" }, { where: { id_usuario } });
  }

  async registerOwner(id_usuario: string) {
    await this.resetOwner();
    await this.updateOwner(id_usuario);
  }

  async cleanType(tipo: string, botInfo: Partial<Bot>) {
    let { limite_diario } = botInfo;
    if (
      !limite_diario?.limite_tipos[tipo as keyof typeof limite_diario.limite_tipos] ||
      tipo === "comum" ||
      tipo === "dono"
    )
      return false;
    await Users.update({ tipo: "comum" }, { where: { tipo } });
    return true;
  }

  async getUsersType(tipo: string): Promise<Users[]> {
    return await Users.findAll({ where: { tipo } });
  }

  async changeUserType(id_usuario: string, tipo: string) {
    await Users.update({ tipo }, { where: { id_usuario } });
  }

  async alterarTipoUsuario(id_usuario: string, tipo: string, botInfo: Partial<Bot>) {
    let { limite_diario } = botInfo;
    if (!limite_diario) return false;
    if (
      limite_diario.limite_tipos[tipo as keyof typeof limite_diario.limite_tipos] &&
      tipo !== "dono"
    ) {
      await this.changeUserType(id_usuario, tipo);
      return true;
    } else {
      return false;
    }
  }

  async resetCommandsDay() {
    await Users.update({ comandos_dia: 0 }, { where: {} });
  }

  async resetUserDayCommands(id_usuario: string) {
    await Users.update({ comandos_dia: 0 }, { where: { id_usuario } });
  }

  async limparComandos(qtd = 0) {
    await Users.update({ comandos_total: qtd, comandos_dia: qtd }, { where: {} });
    return true;
  }

  async updateName(id_usuario: string, nome: string) {
    await Users.update({ nome }, { where: { id_usuario } });
  }

  async verificarUltrapassouLimiteComandos(id_usuario: string, botInfo: Partial<Bot>) {
    let usuario = await this.getUser(id_usuario);
    let maxComandos: number | null = 0;
    if (!usuario) return false;

    if (botInfo && botInfo.limite_diario && botInfo.limite_diario.limite_tipos) {
      const tipo = usuario.tipo as keyof typeof botInfo.limite_diario.limite_tipos;
      maxComandos = botInfo.limite_diario.limite_tipos[tipo].comandos;
      if (!maxComandos) return false;
    }
    return usuario.comandos_dia >= maxComandos;
  }

  async addContagemDiaria(id_usuario: string) {
    await Users.update(
      {
        comandos_total: Sequelize.literal("comandos_total + 1"),
        comandos_dia: Sequelize.literal("comandos_dia + 1"),
      },
      { where: { id_usuario } },
    );
  }

  async addContagemTotal(id_usuario: string) {
    await Users.update(
      { comandos_total: Sequelize.literal("comandos_total + 1") },
      { where: { id_usuario } },
    );
  }
}
