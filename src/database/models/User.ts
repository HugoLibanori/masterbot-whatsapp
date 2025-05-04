import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

export default class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare id_usuario: string;
  declare nome: string;
  declare comandos_total: number;
  declare comandos_dia: number;
  declare tipo: string;
  declare advertencia: number;
  declare pack: string | null;
  declare autor: string | null;

  static initial(sequelize: Sequelize) {
    Users.init(
      {
        id_usuario: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: DataTypes.STRING,
        },
        comandos_total: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        comandos_dia: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        tipo: {
          type: DataTypes.STRING,
          defaultValue: "comum",
        },
        advertencia: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        pack: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
        autor: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
