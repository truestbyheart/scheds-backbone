// @ts-nocheck
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Promise.all([
        queryInterface.changeColumn('calendars', 'recursionId', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'recursions',
            key: 'id'
          }
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
