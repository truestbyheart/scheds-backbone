// @ts-nocheck
// export interface IRecursion {
//   id: string;
//   title: string;
//   description: string;
//   workspaceId?: string;
//   creator: number;
//   colorId: number;
//   linkId?: number;
//   manageeId?: number | null | undefined;
// }
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('recursions', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    workspaceId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      }
    },
    creator: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    colorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'colors',
        key: 'id'
      }
    },
    linkId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'meetingLinks',
        key: 'id'
      }
    },
    manageeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'manages',
        key: 'id'
      }
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('recursions'),
};
