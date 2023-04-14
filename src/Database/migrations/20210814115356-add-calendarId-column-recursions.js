//@ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('calendars', 'recursionId', { transaction: t }),
    queryInterface.addColumn('recursions', 'calendarId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'calendars',
        key: 'id'
      }
    },{ transaction: t })
  ])),

  down: async (queryInterface, Sequelize) => Promise.resolve()
};
