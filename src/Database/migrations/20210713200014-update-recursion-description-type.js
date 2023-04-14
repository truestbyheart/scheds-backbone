// @ts-nocheck
'use strict';

module.exports = {
  up:  (queryInterface, Sequelize) => {
   return  queryInterface.changeColumn('recursions', 'description', { 
     type: Sequelize.TEXT,
     allowNull: true, 
    });
  },

  down:  (queryInterface, Sequelize) => {
    return Promise.resolve()
  }
};
