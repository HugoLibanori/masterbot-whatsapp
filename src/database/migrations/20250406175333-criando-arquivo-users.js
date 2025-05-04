export async function up(queryInterface, Sequelize) {
  return await queryInterface.createTable("users", {
    id_usuario: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    comandos_total: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    comandos_dia: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    tipo: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "comum",
    },
    advertencia: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pack: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    autor: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
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
  return await queryInterface.dropTable("users");
}
