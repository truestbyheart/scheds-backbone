// @ts-nocheck
// export interface IEvent {
//   id: string;
//   duration: number;
//   recursionId: string;
//   host: number;
// }
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('events', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'durations',
        key: 'id'
      }
    },
    recursionId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'recursions',
        key: 'id'
      }
    },
    host: {
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

  down: (queryInterface, Sequelize) => queryInterface.dropTable('events'),
};
