
function withTimeStamps(queryInterface, Sequelize) {
  return {
    createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
  }
}

function getAddressesTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.DataTypes.INTEGER },
    address: Sequelize.DataTypes.STRING,
    suburb: Sequelize.DataTypes.STRING,
    state: Sequelize.DataTypes.STRING,
    postcode: { type: Sequelize.DataTypes.STRING, validate: { len: [4, 17] } },
    country: Sequelize.DataTypes.STRING,
  }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

function getEmailTemplatesTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.DataTypes.INTEGER },
    name: {type: Sequelize.DataTypes.STRING, allowNull: false, unique: true},
    isMarkDown: {type: Sequelize.DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    from: {type: Sequelize.DataTypes.STRING, allowNull: false},
    subject: {type: Sequelize.DataTypes.STRING, allowNull: false},
    body: {type: Sequelize.DataTypes.TEXT, allowNull: false},
    metadata: {type: Sequelize.DataTypes.JSON},
  }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

function getInvoicesTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.DataTypes.INTEGER },
    totalAmountInCents: Sequelize.DataTypes.BIGINT,
    paymentDate: Sequelize.DataTypes.DATE,
    paymentMethod: Sequelize.DataTypes.STRING,
    reference: Sequelize.DataTypes.STRING,
    paymentStatus: Sequelize.DataTypes.STRING,
    transactionId: Sequelize.DataTypes.STRING,
  }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

function getLogEntriesTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.DataTypes.INTEGER },
    timestamp: { type: Sequelize.DataTypes.DATE, allowNull: false },
    action: { type: Sequelize.DataTypes.STRING, allowNull: false },
    message: { type: Sequelize.DataTypes.STRING, allowNull: false },
    severity: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 10 }
    },
    meta: Sequelize.DataTypes.JSON,
  }

  return m
}

function getMemberInvoicesTableDefinition(queryInterface, Sequelize) {
  const m = {
  }

  // association fields
  m.invoiceId = { type: Sequelize.DataTypes.INTEGER, allowNull: false }
  m.memberId = { type: Sequelize.DataTypes.UUID, allowNull: false }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

function getMembersTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: {type: Sequelize.DataTypes.UUID, primaryKey: true},
    email: {type: Sequelize.DataTypes.STRING},
    givenNames: Sequelize.DataTypes.STRING,
    surname: Sequelize.DataTypes.STRING,
    dateOfBirth: Sequelize.DataTypes.DATEONLY,
    gender: Sequelize.DataTypes.STRING,
    primaryPhoneNumber: Sequelize.DataTypes.STRING,
    secondaryPhoneNumber: Sequelize.DataTypes.STRING,
    type: Sequelize.DataTypes.STRING,
    status: Sequelize.DataTypes.STRING,
    verified: {type: Sequelize.DataTypes.DATE, allowNull: true},
    verificationHash: {type: Sequelize.DataTypes.STRING, allowNull: true},
    memberSince: {type: Sequelize.DataTypes.DATE, allowNull: true},
    expiresOn: {type: Sequelize.DataTypes.DATE, allowNull: false},
    lastRenewalReminder: {type: Sequelize.DataTypes.DATE, allowNull: true},
    renewalHash: {type: Sequelize.DataTypes.UUID, allowNull: true},
    isPostalAddressDifferent: {type: Sequelize.DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
  }

  // association fields
  m.postalAddressId = { type: Sequelize.DataTypes.INTEGER }
  m.residentialAddressId = { type: Sequelize.DataTypes.INTEGER }
  m.userId = { type: Sequelize.DataTypes.INTEGER }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

function getUsersTableDefinition(queryInterface, Sequelize) {
  const m = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.DataTypes.INTEGER },
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hash: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false
    },
    salt: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    activationKey: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    },
    resetPasswordKey: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    },
    verified: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true
    },
    enabled: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastAuthenticated: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    data: {
      type: Sequelize.DataTypes.JSON,
      defaultValue: {}
    },
  }

  return Object.assign({}, m, withTimeStamps(queryInterface, Sequelize))
}

module.exports = {
  up: function(queryInterface, Sequelize, done) {
    Sequelize.Promise.all([
      queryInterface.createTable('Addresses', getAddressesTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('EmailTemplates', getEmailTemplatesTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('Invoices', getInvoicesTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('LogEntries', getLogEntriesTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('MemberInvoices', getMemberInvoicesTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('Members', getMembersTableDefinition(queryInterface, Sequelize)),
      queryInterface.createTable('Users', getUsersTableDefinition(queryInterface, Sequelize)),
    ]).nodeify(done)
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropAllTables()
  }
}
