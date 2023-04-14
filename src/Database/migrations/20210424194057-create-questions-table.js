// @ts-nocheck
// export interface IQuestion {
//   recursionId: string;
//   inquiry: string;
// }
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) =>  queryInterface.createTable('questions', { 
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    recursionId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'recursions',
        key: 'id'
      }
    },
    inquiry: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('questions'),
};
