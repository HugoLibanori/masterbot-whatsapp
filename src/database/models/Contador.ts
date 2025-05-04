import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";

export default class Contador extends Model<
  InferAttributes<Contador>,
  InferCreationAttributes<Contador>
> {
  declare id_grupo: string;
  declare id_usuario: string;
  declare msg: number;
  declare imagem: number;
  declare audio: number;
  declare sticker: number;
  declare video: number;
  declare outro: number;
  declare texto: number;
  static initial(sequelize: Sequelize) {
    Contador.init(
      {
        id_grupo: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        id_usuario: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        msg: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        imagem: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        audio: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        sticker: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        video: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        outro: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        texto: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "contador",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
