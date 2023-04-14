// @ts-nocheck
// export interface ICalendarModel {
//   id?: number;
//   calendarId?: string;
//   recursionId: string;
//   summary?: string;
// }

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>  queryInterface.createTable('calendars', { 
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    calendarId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    summary: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    recursionId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'recursions',
        key: 'id'
      }
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('calendars')
};
