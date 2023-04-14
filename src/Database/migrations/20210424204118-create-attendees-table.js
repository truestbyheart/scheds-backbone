// @ts-nocheck
// export interface IAttendee {
//   user_id: number;
//   id?: number;
//   meeting_id: number;
// }

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('attendees', { 
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    meeting_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'meetings',
        key: 'id'
      }
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: async (queryInterface, Sequelize) =>  queryInterface.dropTable('attendees')
};
