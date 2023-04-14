// @ts-nocheck
// export enum MeetingLinksTypes {
//   OPEN = 'open',
//   CLOSED = 'closed',
// }

// export interface IMeetingLinks {
//   id?: number;
//   link: string;
//   code: string;
//   status?: MeetingLinksTypes;
// }

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('meetingLinks', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    link: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('open', 'closed'),
      allowNull: true
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('meetingLinks'),
};
