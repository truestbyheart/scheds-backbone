// @ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('workspaces', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
    }),

  down: async () => Promise.resolve(),
};
