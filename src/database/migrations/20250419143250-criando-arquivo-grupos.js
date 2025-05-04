export async function up(queryInterface, Sequelize) {
  return await queryInterface.createTable("grupos", {
    id_grupo: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    participantes: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    admins: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    dono: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    restrito_msg: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mutar: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bemvindo: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { status: false, msg: "" },
    },
    antifake: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { status: false, ddi_liberados: [] },
    },
    antilink: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {
        status: false,
        filtros: { instagram: false, youtube: false, facebook: false },
      },
    },
    antiporno: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    antiflood: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { status: false, max: 10, intervalo: 10, msgs: [] },
    },
    autosticker: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contador: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { status: false, inicio: "" },
    },
    block_cmds: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    lista_negra: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    descricao: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    },
  });
}

export async function down(queryInterface) {
  return await queryInterface.dropTable("grupos");
}
