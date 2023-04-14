// @ts-nocheck
// export interface IResponseT {
//   responder: number;
//   question_id: number;
//   answer: string;
// }

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('responses', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    responder: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'guests',
        key: 'id'
      }
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    answer: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: new Date() },
    deletedAt: { allowNull: true, type: Sequelize.DATE }
  }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('responses'),
};
