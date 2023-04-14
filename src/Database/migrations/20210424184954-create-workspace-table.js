// @ts-nocheck
// export interface IWorkspace {
//   id: string;
//   name: string;
//   description?: string;
//   owner: number;
// }
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('workspaces', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    owner: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),
  down: async (queryInterface, Sequelize) => queryInterface.dropTable('workspaces'),
};
