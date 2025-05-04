export async function up(queryInterface, Sequelize) {
  return await queryInterface.createTable("bot", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    started: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    },
    number_bot: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "M@ste® Bot",
    },
    name_admin: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Hugo",
    },
    author_sticker: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "M@ste® Bot",
    },
    pack_sticker: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "M@ste® Bot Stickers",
    },
    prefix: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "!",
    },
    executed_cmds: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    autosticker: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    block_cmds: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    },
    limite_diario: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: JSON.stringify({
        status: false,
        expiracao: 0,
        limite_tipos: {
          comum: { titulo: "Comum", comandos: 10 },
          premium: { titulo: "Premium", comandos: 30 },
          vip: { titulo: "VIP", comandos: 50 },
          dono: { titulo: "Dono", comandos: null },
        },
      }),
    },
    commands_pv: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    command_rate: {
      type: Sequelize.JSON,
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
      type: Sequelize.STRING,
      allowNull: true,
    },
    apis: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {
        google: {
          api_key: "",
        },
      },
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface) {
  return await queryInterface.dropTable("bot");
}
