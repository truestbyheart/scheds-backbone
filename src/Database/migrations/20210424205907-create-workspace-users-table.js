// @ts-nocheck
// export enum RoleType {
//   OWNER = 'owner',
//   EDITOR = 'editor',
//   VIEWER = 'viewer',
// }

// export interface IWorkspaceUser {
//   id?: number;
//   userId: number;
//   workspaceId: string;
//   role?: RoleType;
// }

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) =>  queryInterface.createTable('workspaceusers', { 
    id:{
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
    workspaceId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      }
    },
    role: {
      type: Sequelize.ENUM('owner', 'editor', 'viewer'),
      allowNull: false
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
   }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('workspaceusers')
};
