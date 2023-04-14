// @ts-nocheck
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('colors', [
          {
              "id": 1,
              "background": "#a4bdfc",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 2,
              "background": "#7ae7bf",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 3,
              "background": "#dbadff",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 4,
              "background": "#ff887c",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 5,
              "background": "#fbd75b",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 6,
              "background": "#ffb878",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 7,
              "background": "#46d6db",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 8,
              "background": "#e1e1e1",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 9,
              "background": "#5484ed",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 10,
              "background": "#51b749",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          },
          {
              "id": 11,
              "background": "#dc2127",
              "foreground": "#1d1d1d",
              "createdAt": new Date(),
              "updatedAt": new Date()
          }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('colors', null, {});
  }
};
