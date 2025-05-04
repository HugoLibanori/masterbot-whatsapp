import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";

export default class GruposVerificados extends Model<
  InferAttributes<GruposVerificados>,
  InferCreationAttributes<GruposVerificados>
> {
  declare id_grupo: string;
  declare nome: string;
  declare inicio: string;
  declare expiracao: string;
  static initial(sequelize: Sequelize) {
    GruposVerificados.init(
      {
        id_grupo: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        inicio: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        expiracao: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "gruposVerificados",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
