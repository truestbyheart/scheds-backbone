// @ts-nocheck
// export interface IMeeting {
//   id?: number;
//   event_id: string;
//   limit: number;
//   duration: number;
//   calendarState?: string;
//   calmeetId?: string;
// }

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('meetings', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    event_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    limit: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'durations',
        key: 'id'
      }
    },
    calendarState: {
      type: Sequelize.STRING,
      allowNull: true
    },
    calmeetId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('meetings'),
};
