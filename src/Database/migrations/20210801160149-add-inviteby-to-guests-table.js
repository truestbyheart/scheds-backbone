//@ts-nocheck
'use strict';
module.exports = {
  up:  (queryInterface, Sequelize) => 
  Promise.all([
    // add inviteBy to guests table
    queryInterface.addColumn('guests', 'invitedBy', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    }),
  ]),

  down:  (queryInterface, Sequelize) => Promise.resolve()
};
