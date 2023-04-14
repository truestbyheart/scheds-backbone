// @ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([queryInterface.addColumn('zooms', 'zoomId', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'me',
  }),
  queryInterface.changeColumn('zooms', 'userId', {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  })
  ]),

  down: (queryInterface, Sequelize) => Promise.resolve(),
};
