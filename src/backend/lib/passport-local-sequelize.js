/**
 * Refactor of passport-local-sequelize @ 0.6.0
 * (yes I could fork, patch etc but time...)
 *
 * TODO:
 *   - Promisify functions, remove cb everywhere
 *
 * Done:
 *   - ES6
 *   - Adds sequelize options for orm calls, (e.g. ability to set transaction on create/save/update)
 *   - Adds sequelize options for model definition, (e.g. ability to set transaction on create/save/update)
 *   - Set a default digest b/c sha1 defaults in node crypto... it's 2017.
 *
 * original source https://raw.githubusercontent.com/madhurjain/passport-local-sequelize/9cd135294013833993bd9394797956668d183c2d/lib/passport-local-sequelize.js
 */
const {Promise} = require("bluebird")
global.Promise = Promise

const util = require('util'),
  crypto = Promise.promisifyAll(require('crypto')),
  _ = require('lodash'),
  Sequelize = require('sequelize'),
  LocalStrategy = require('passport-local').Strategy

// The default option values
let defaultAttachOptions = {
  activationkeylen: 8,
  resetPasswordkeylen: 8,
  saltlen: 32,
  iterations: 12000,
  keylen: 512,
  digestAlgorithm: 'sha256',
  usernameField: 'username',
  usernameLowerCase: false,
  activationRequired: false,
  hashField: 'hash',
  saltField: 'salt',
  activationKeyField: 'activationKey',
  resetPasswordKeyField: 'resetPasswordKey',
  incorrectPasswordError: 'Incorrect password',
  incorrectUsernameError: 'Incorrect username',
  incorrectUsernameOrPasswordError: 'Incorrect username or password',
  invalidActivationKeyError: 'Invalid activation key',
  invalidResetPasswordKeyError: 'Invalid reset password key',
  missingUsernameError: 'Field %s is not set',
  missingFieldError: 'Field %s is not set',
  missingPasswordError: 'Password argument not set!',
  userExistsError: 'Could not create an account with %s at this time, please contact us', // error message shouldn't reveal why this failed, info leak etc.
  activationError: 'Email activation required',
  noSaltValueStoredError: 'Authentication not possible. No salt value stored in db!'
}

// The default schema used when creating the User model
let defaultUserSchema = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  hash: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  salt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  activationKey: {
    type: Sequelize.STRING,
    allowNull: true
  },
  resetPasswordKey: {
    type: Sequelize.STRING,
    allowNull: true
  },
  verified: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  enabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  lastAuthenticated: {
    type: Sequelize.DATE,
    allowNull: true
  },
}

const shimPbkdf2 = function(password, salt, iterations, keylen, digest, callback) {
  let params = [password, salt, iterations, keylen, digest]
  try {
    const promise = crypto.pbkdf2Async.apply(crypto, params)
    if (callback) {
      return promise.asCallback(callback)
    }
    return promise
  } catch (error) {
    if (callback) {
      return Promise.reject(error).asCallback(error)
    }
    return Promise.reject(error)
  }
}

const attachToUser = function(UserSchema, options) {
  // Get our options with default values for things not passed in
  options = _.defaults(options || {}, defaultAttachOptions)

  UserSchema.beforeCreate(function(user, op, next) {
    // if specified, convert the username to lowercase
    if (options.usernameLowerCase) {
      user[options.usernameField] = user[options.usernameField].toLowerCase()
    }
    if (typeof(next) === 'function') {
      next(null, user)
    }
  })

  UserSchema.serializeUser = function() {
    return function(user, cb) {
      cb(null, user.get(options.usernameField))
    }
  }

  UserSchema.deserializeUser = function() {
    return function(username, cb) {
      UserSchema.findByUsername(username, cb)
    }
  }

  UserSchema.prototype.setPassword = function(password) {
    if (!password) {
      throw new Error(options.missingPasswordError)
    }

    return crypto.randomBytesAsync(options.saltlen)
      .then((buf) => {
        let salt = buf.toString('hex')
        this.set(options.saltField, salt)
        return shimPbkdf2(password, salt, options.iterations, options.keylen, options.digestAlgorithm)
      }).then((hashRaw) => {
        this.set(options.hashField, new Buffer(hashRaw, 'binary').toString('hex'))
        return Promise.resolve(this)
      })
  }

  UserSchema.prototype.setActivationKey = function() {
    if (!options.activationRequired) {
      return this
    }

    return crypto.randomBytesAsync(options.activationkeylen)
      .then((buf) => {
        let randomHex = buf.toString('hex')
        this.set(options.activationKeyField, randomHex)
        return this
      })
  }

  UserSchema.prototype.authenticate = function(password, cb) {
    // prevent to throw error from crypto.pbkdf2
    if (!this.get(options.saltField)) {
      return cb(null, false, { message: options.noSaltValueStoredError })
    }

    if (!this.get('enabled')){
      return cb(null, false, { message: options.incorrectUsernameOrPasswordError });
    }

    // TODO: Fix callback and behavior to match passport
    crypto.pbkdf2(password, this.get(options.saltField), options.iterations, options.keylen, options.digestAlgorithm, (error, hashRaw) => {
      if (error) {
        return cb(error)
      }

      let hash = new Buffer(hashRaw, 'binary').toString('hex');

      if (hash === this.get(options.hashField)) {
        this.lastAuthenticated = new Date()
        this.save()
        return cb(null, this)
      } else {
        return cb(null, false, { message: options.incorrectUsernameOrPasswordError });
      }
    })
  }

  UserSchema.prototype.checkPasswordPromise = function(password) {
    if (!this.get(options.saltField)) {
      return Promise.reject(new Error(options.noSaltValueStoredError))
    }

    return shimPbkdf2(password, this.get(options.saltField), options.iterations, options.keylen, options.digestAlgorithm)
      .then((hashRaw) => {
        let hash = new Buffer(hashRaw, 'binary').toString('hex');

        // passwords match?
        return hash === this.get(options.hashField)
      }).catch((error) => {
        return Promise.reject(new Error(error))
      })
  }

  UserSchema.authenticate = function(username, password, cb) {
    if (options.usernameLowerCase) {
      username = username.toLowerCase()
    }

    UserSchema.findByUsername(username, function(error, user) {
      if (error) {
        return cb(error)
      }

      if (user) {
        return user.authenticate(password, cb)
      } else {
        return cb(null, false, {message: options.incorrectUsernameError})
      }
    })
  }

  UserSchema.register = function(user, password, sequelizeOptions) {
    let fields = {}

    if (user instanceof UserSchema) {
      // Do nothing
    } else if (_.isString(user)) {
      // Create an instance of this in case user is passed as username
      fields[options.usernameField] = user
      user = UserSchema.build(fields)
    } else if (_.isObject(user)) {
      // Create an instance if user is passed as fields
      user = UserSchema.build(user)
    }

    if (!user.get(options.usernameField)) {
      return Promise.reject(new Error(util.format(options.missingUsernameError, options.usernameField)))
    }

    return UserSchema.findByUsername(user.get(options.usernameField))
      .then((existingUser) => {
        if (existingUser) {
          return Promise.reject(new Error(util.format(options.userExistsError, user.get(options.usernameField))))
        }

        return user.setPassword(password)
      }).then((user) => {
        return user.setActivationKey()
      }).then((user) => {
        return user.save(sequelizeOptions)
      })
  }

  UserSchema.activate = function(username, password, activationKey, cb) {
    // broken
    UserSchema.authenticate(username, password, function(error, user, info) {

      if (error) {
        return cb(error);
      }

      if (!user) {
        return cb(info);
      }

      if (user.get(options.activationKeyField) === activationKey) {
        user.updateAttributes({verified: true, activationKey: 'null'})
          .then(function() {
            return cb(null, user);
          })
          .catch(function(error) {
            return cb(error);
          });
      } else {
        return cb({message: options.invalidActivationKeyError});
      }
    });
  };

  UserSchema.findByUsername = function(username, cb) {
    let queryParameters = {}

    // if specified, convert the username to lowercase
    if (options.usernameLowerCase) {
      username = username.toLowerCase()
    }

    queryParameters[options.usernameField] = username

    let query = UserSchema.find({where: queryParameters})
    if (options.selectFields) {
      query.select(options.selectFields)
    }

    if (cb){
      query.then(function(user) {
        cb(null, user)
      })
      query.catch(function(error) {
        cb(error)
      })
      return
    }

    return query
  }

  UserSchema.setResetPasswordKeyByUsername = function(username, cb) {
    return UserSchema.findByUsername(username)
      .then((user) => {
        return user.setResetPasswordKey()
      })
      .then((user) => {
        if (cb) {
          return cb(null, user)
        }
        return Promise.resolve(user)
      })
      .catch((error) => {
        if (cb) {
          return cb({message: options.incorrectUsernameError})
        }
      })
  }

  UserSchema.prototype.setResetPasswordKey = function(sequelizeOptions) {
    return Promise.all([
      Promise.resolve(this),
      crypto.randomBytesAsync(options.resetPasswordkeylen)
    ])
    .spread((user, buffer) => {
      const randomHex = buffer.toString('hex')

      user.set(options.resetPasswordKeyField, randomHex)
      return user.save(sequelizeOptions || {})
    })
  }

  UserSchema.resetPassword = function(username, password, resetPasswordKey) {
    return UserSchema.findByUsername(username)
      .then((user) => {
        if (!user){
          throw new Error(options.incorrectUsernameError)
        }

        if (user.get(options.resetPasswordKeyField) === resetPasswordKey) {
          return user.setPassword(password)
        }
        throw new Error(options.invalidResetPasswordKeyError)
      })
      .then((user) => {
        user.set(options.resetPasswordKeyField, null)
        user.save()
        return Promise.resolve(user)
      })
  }


  UserSchema.createStrategy = function() {
    return new LocalStrategy(options, UserSchema.authenticate)
  }
}

const defineUser = function(sequelize, extraFields, sequelizeOptions, attachOptions) {
  const schema = _.defaults(extraFields || {}, defaultUserSchema)
  const User = sequelize.define('User', schema, sequelizeOptions)

  attachToUser(User, attachOptions)
  return User
}

module.exports = {
  defaultAttachOptions: defaultAttachOptions,
  defaultUserSchema: defaultUserSchema,
  attachToUser: attachToUser,
  defineUser: defineUser
}
