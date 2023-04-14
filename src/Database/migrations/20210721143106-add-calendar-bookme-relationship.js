// @ts-nocheck
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Promise.all([
        queryInterface.removeColumn('bookmes', 'calendarId'),
        queryInterface.addColumn('bookmes', 'calendarId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'calendars', key: 'id' }
        })
      ])
    } catch (error) {
      console.log(error)
    }
     
  },

  down: (queryInterface, Sequelize) => {
      return Promise.resolve()
  }
};
