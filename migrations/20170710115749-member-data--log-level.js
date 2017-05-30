'use strict'

module.exports = {
  up: function(queryInterface, Sequelize) {
    Sequelize.Promise.all([
      queryInterface.addColumn(
        'LogEntries',
        'level',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        }
      ),
      queryInterface.addColumn(
        'Members',
        'data',
        {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {},
        }
      ),
    ])
  },

  down: function(queryInterface, Sequelize) {
    Sequelize.Promise.all([
      queryInterface.removeColumn('LogEntries', 'level'),
      queryInterface.removeColumn('Members', 'data'),
    ])
  }
}
