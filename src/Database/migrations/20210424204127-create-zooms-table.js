// @ts-nocheck
// export interface IZoom {
//   id?: number;
//   userId: number;
//   accessToken: string;
//   refreshToken: string;
// }

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('zooms', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    accessToken: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('zooms'),
};
