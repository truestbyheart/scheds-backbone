// @ts-nocheck
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('meetings', 'initialLimit', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }),
    queryInterface.addColumn('meetings', 'linkId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'meetingLinks',
        key: 'id'
      }
    }),
  ]),

  down: (queryInterface, Sequelize) => Promise.resolve()
};
