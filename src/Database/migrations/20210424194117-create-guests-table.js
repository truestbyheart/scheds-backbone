// @ts-nocheck
// export interface IGuest {
//   id?: number;
//   name?: string;
//   email: string;
//   meetingId?: number | null;
//   recursionId?: string;
//   calMeetId?: string | null | undefined;
//   bookmeId?: string;
//   startTime?: Date;
//   endTime?: Date;
//   reason?: string;
// }

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('guests', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    meetingId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'meetings',
        key: 'id'
      }
    },
    recursionId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'recursions',
        key: 'id'
      }
    },
    calMeetId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bookmeId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'bookmes',
        key: 'id'
      }
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: true,
    }, 
    endTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('guests')
};
