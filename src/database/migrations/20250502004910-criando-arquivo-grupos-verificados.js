export async function up(queryInterface, Sequelize) {
  return await queryInterface.createTable("gruposVerificados", {
    id_grupo: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    inicio: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    expiracao: {
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
  return await queryInterface.dropTable("gruposVerificados");
}
