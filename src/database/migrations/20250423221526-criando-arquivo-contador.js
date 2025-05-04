export async function up(queryInterface, Sequelize) {
  return await queryInterface.createTable("contador", {
    id_grupo: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    id_usuario: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    msg: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imagem: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    audio: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sticker: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    video: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    outro: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    texto: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
  return await queryInterface.dropTable("contador");
}
