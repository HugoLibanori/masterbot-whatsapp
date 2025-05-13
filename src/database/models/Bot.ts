import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";

export default class Bot extends Model<InferAttributes<Bot>, InferCreationAttributes<Bot>> {
  declare id?: number;
  declare started: Date;
  declare name: string;
  declare number_bot: string;
  declare name_admin: string;
  declare author_sticker: string;
  declare pack_sticker: string;
  declare prefix: string;
  declare executed_cmds: number;
  declare autosticker: boolean;
  declare block_cmds: string[];
  declare limite_diario: {
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
    };
  };
  declare commands_pv: boolean;
  declare command_rate: {
    status: boolean;
    max_cmds_minute: number;
    block_time: number;
  };
  declare grupo_oficial: string | null;
  declare apis: {
    google: {
      api_key: string;
    };
    simi: {
      api_key: string;
    };
  };

  static initial(sequelize: Sequelize) {
    Bot.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        started: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        number_bot: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "M@ste® Bot",
        },
        name_admin: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "Hugo",
        },
        author_sticker: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "M@ste® Bot",
        },
        pack_sticker: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "M@ste® Bot Stickers",
        },
        prefix: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "!",
        },
        executed_cmds: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        autosticker: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        block_cmds: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        limite_diario: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {
            status: false,
            expiracao: 0,
            limite_tipos: {
              comum: { titulo: "Comum", comandos: 10 },
              premium: { titulo: "Premium", comandos: 30 },
              vip: { titulo: "VIP", comandos: 50 },
              dono: { titulo: "Dono", comandos: null },
            },
          },
        },
        commands_pv: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        command_rate: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {
            status: false,
            max_cmds_minute: 10,
            block_time: 5,
            user: [],
            user_limit: [],
          },
        },
        grupo_oficial: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        apis: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {
            google: {
              api_key: "",
            },
            simi: {
              api_key: "",
            },
          },
        },
      },
      {
        sequelize,
        tableName: "bot",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    );
  }
}
