// @ts-nocheck
// export interface IUser {
//   id?: number;
//   name?: string;
//   provider?: string;
//   photoUrl?: string;
//   email: string;
//   type?: UserType;
//   gRefreshToken?: string;
// }
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('users', { 
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
    provider: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    photoUrl: {
      type: Sequelize.STRING,
      allowNull: true, 
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true, 
    },
    type: {
      type: Sequelize.ENUM('user', 'guest'),
      allowNull: false,
      default: 'user',
    },
    gRefreshToken: {
      type: Sequelize.STRING,
      allowNull: true, 
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('users'),
};
