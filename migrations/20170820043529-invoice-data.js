'use strict'

module.exports = {
  up: function(queryInterface, Sequelize) {
    Sequelize.Promise.all([
      queryInterface.addColumn(
        'Invoices',
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
      queryInterface.removeColumn('Invoices', 'data'),
    ])
  }
}
