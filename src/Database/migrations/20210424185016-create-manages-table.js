// @ts-nocheck
// export interface IManage {
//   id?: number;
//   manager: number;
//   managee: number;
// }
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) =>  queryInterface.createTable('manages', { 
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    manager: {
      type: Sequelize.INTEGER,
      allowNull: false, 
      references: {
        model: 'users',
        key: 'id'
      }
    },
    managee: {
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

  down: async (queryInterface, Sequelize) =>queryInterface.dropTable('manages')
};
