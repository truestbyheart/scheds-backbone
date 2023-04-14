// @ts-nocheck
// export interface IBookMe {
//   id: string;
//   user_id: number;
//   startDate?: string;
//   endDate?: string;
//   startTime?: string;
//   endTime?: string;
//   colorId: number;
//   calendarId: string;
//   location: string;
//   linkId?: number;
// }
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('bookmes', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: true
    },
    endTime: {
      type: Sequelize.DATE,
      allowNull: true
    },
    colorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'colors',
        key: 'id'
      }
    },
    calendarId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    linkId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'meetingLinks',
        key: 'id'
      }
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('bookmes'),
};
