// @ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.removeColumn('meetingLinks', 'code'),
    queryInterface.removeColumn('meetingLinks', 'status'),
    queryInterface.changeColumn('meetingLinks', 'link', { type: Sequelize.TEXT, allowNull: false }),
  ]),

  down: (queryInterface, Sequelize) => Promise.resolve(),
};
