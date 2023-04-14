// @ts-nocheck
// export interface IColors {
//   id?: number;
//   background: string;
//   foreground: string;
// }
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('colors', {
     id: {
       type: Sequelize.INTEGER,
       allowNull: false,
       primaryKey: true,
       autoIncrement: true
      },
      background: {
        type: Sequelize.STRING,
        allowNull: false
      },
      foreground: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
      deletedAt: { allowNull: true, type: Sequelize.DATE }
    }),
  down: async (queryInterface, Sequelize) =>  queryInterface.dropTable('colors'),
};
