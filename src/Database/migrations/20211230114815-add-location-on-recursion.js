// @ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('recursions', 'location', {
    type: Sequelize.ENUM('meet', 'zoom'),
    allowNull: false,
    defaultValue: 'meet',
  }),

  down: (queryInterface, Sequelize) => Promise.resolve()
};
