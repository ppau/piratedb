

module.exports = {
  up: function(queryInterface, Sequelize, done) {
    Sequelize.Promise.all([
      // MemberInvoices
      queryInterface.addConstraint('MemberInvoices', ["invoiceId", "memberId"], {
        type: 'PRIMARY KEY',
        name: 'MemberInvoices_pkey'
      }),
      queryInterface.addConstraint('MemberInvoices', ['invoiceId'], {
        type: 'FOREIGN KEY',
        name: 'MemberInvoices_invoiceId_fkey',
        references: {
          table: 'Invoices',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('MemberInvoices', ['memberId'], {
        type: 'FOREIGN KEY',
        name: 'MemberInvoices_memberId_fkey',
        references: {
          table: 'Members',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      // CONSTRAINT "MemberInvoices_pkey" PRIMARY KEY ("invoiceId", "memberId"),
      // CONSTRAINT "MemberInvoices_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices" (id) ON DELETE CASCADE ON UPDATE CASCADE,
      // CONSTRAINT "MemberInvoices_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" (id) ON DELETE CASCADE ON UPDATE CASCADE

      // Members
      queryInterface.addConstraint('Members', ['postalAddressId'], {
        type: 'FOREIGN KEY',
        name: 'Members_postalAddressId_fkey',
        references: {
          table: 'Addresses',
          field: 'id'
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('Members', ['residentialAddressId'], {
        type: 'FOREIGN KEY',
        name: 'Members_residentialAddressId_fkey',
        references: {
          table: 'Addresses',
          field: 'id'
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('Members', ['userId'], {
        type: 'FOREIGN KEY',
        name: 'Members_userId_fkey',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'set null',
        onUpdate: 'cascade'
      }),
      // CONSTRAINT "Members_postalAddressId_fkey" FOREIGN KEY ("postalAddressId") REFERENCES "Addresses" (id) ON DELETE SET NULL ON UPDATE CASCADE,
      // CONSTRAINT "Members_residentialAddressId_fkey" FOREIGN KEY ("residentialAddressId") REFERENCES "Addresses" (id) ON DELETE SET NULL ON UPDATE CASCADE,
      // CONSTRAINT "Members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" (id) ON DELETE SET NULL ON UPDATE CASCADE

    ]).nodeify(done)
  },

  down: function(queryInterface, Sequelize, done) {
    Sequelize.Promise.all([
      queryInterface.removeConstraint('MemberInvoices', 'MemberInvoices_pkey'),
      queryInterface.removeConstraint('MemberInvoices', 'MemberInvoices_invoiceId_fkey'),
      queryInterface.removeConstraint('MemberInvoices', 'MemberInvoices_memberId_fkey'),
      queryInterface.removeConstraint('Members', 'Members_postalAddressId_fkey'),
      queryInterface.removeConstraint('Members', 'Members_residentialAddressId_fkey'),
      queryInterface.removeConstraint('Members', 'Members_userId_fkey'),
    ]).nodeify(done)
  }
}
