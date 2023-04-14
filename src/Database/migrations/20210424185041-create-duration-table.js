// @ts-nocheck
// export interface IDuration {
//   id?: number;
//   from: Date;
//   to: Date;
// }
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('durations', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    from: {
      type: Sequelize.DATE,
      allowNull: false
    },
    to: {
      type: Sequelize.DATE,
      allowNull: false
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('durations'),
};
