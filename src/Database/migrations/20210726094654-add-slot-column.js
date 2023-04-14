// @ts-nocheck
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
     await Promise.all([
       queryInterface.addColumn('bookmes', 'slotSize', { 
         type: Sequelize.INTEGER, 
         allowNull: false, 
         defaultValue: 30  
        })
      ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.resolve();
  }
};
