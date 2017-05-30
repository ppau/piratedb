
module.exports = (sequelize, DataTypes) => {
  const LogEntry = sequelize.define('LogEntry', {
    timestamp: {type: DataTypes.DATE, allowNull: false},
    level: {type: DataTypes.STRING, allowNull: false},
    action: {type: DataTypes.STRING, allowNull: false},
    message: {type: DataTypes.STRING, allowNull: false},
    severity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {min: 0, max: 10}
    },
    meta: DataTypes.JSON
  }, {
    timestamps: false,
  })

  return LogEntry
}
