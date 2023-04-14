// @ts-nocheck
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.sequelize.query(`alter table "meetings" drop constraint "meetings_duration_fkey"`)
    .then(() => queryInterface.sequelize.query(
      `alter table "meetings"
        add constraint "meetings_duration_fkey" foreign key("duration") references "durations" ("id")
        on delete cascade`
    )),
    queryInterface.sequelize.query(`alter table "meetings" drop constraint "meetings_event_id_fkey"`)
    .then(() => queryInterface.sequelize.query(
      `alter table "meetings"
        add constraint "meetings_event_id_fkey" foreign key("duration") references "durations" ("id")
        on delete cascade`
    )),
  ]),

  down: async (queryInterface, Sequelize) => Promise.resolve(),
};
