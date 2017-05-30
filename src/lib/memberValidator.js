const validator = require("validator")
const moment = require("moment")
const _ = require("lodash")

function isValidVerificationHash(theHash) {
  return validator.isUUID(theHash, "4")
}

function containsSpecialCharacters(theString) {
  return /[\<\>\"\%\;\&\+]/.test(theString)
}

function isValidString(theString) {
  return !!theString &&
        !containsSpecialCharacters(theString)
}

function isValidName(name) {
  return isValidString(name)
}

function isValidGender(gender) {
  return !gender || isValidString(gender)
}

function isValidEmail(email) {
  return validator.isEmail(email)
}

function isValidPhoneNumber(input) {
  return /[-+\s()\d]+/.test(input)
}

function isValidPhone(phone) {
  return (!!phone) && isValidPhoneNumber(phone)
}

function isValidOptionalPhone(phone) {
  return !phone || isValidPhone(phone)
}

function isValidDate(date) {
  const formattedDate = moment.utc(date, "DD/MM/YYYY", true)
  const sixteenYearsAgo = moment.utc().endOf("day").subtract(16, "years")

  return formattedDate.isValid() && formattedDate.isSameOrBefore(sixteenYearsAgo)
}

function isValidServerDate(date) {
  const formattedDate = moment.utc(date, "YYYY-MM-DD", true)
  const sixteenYearsAgo = moment.utc().endOf("day").subtract(16, "years")

  return formattedDate.isValid() && formattedDate.isSameOrBefore(sixteenYearsAgo)
}

function isValidImportDate(date) {
  // Ignores the dob validation because how can you import age required dobs?!
  const formattedDate = moment.utc(date, "DD/MM/YYYY", true)

  return formattedDate.isValid()
}

function isValidPostcode(postcode) {
  return !!postcode && /^.{4,17}$/.test(postcode)
}

function isValidInternationalPostcode(postcode) {
  return !!postcode && postcode.toString().length <= 16
}

function isValidLength(object, minLength, maxLength) {
  const max = Math.min(maxLength, 255)
  const min = Math.max(minLength, 1)

  return (object &&
    object.length <= max &&
    object.length >= min)
}

function isValidCountry(country) {
  return country !== "" && country !== "Select Country"
}

const memberFieldsChecks = {
  givenNames: isValidName,
  surname: isValidName,
  gender: isValidGender,
  email: isValidEmail,
  primaryPhoneNumber: isValidPhone,
  secondaryPhoneNumber: isValidOptionalPhone,
  dateOfBirth: isValidDate
}

const addressFieldChecks = {
  address: isValidString,
  suburb: isValidString,
  postcode: isValidPostcode,
  state: isValidString,
  country: isValidCountry
}

function setUpPostCodeChecks(addressObj, localAddressFieldChecks) {
  if (addressObj && addressObj.country !== "Australia") {
    localAddressFieldChecks.postcode = isValidInternationalPostcode
  } else {
    localAddressFieldChecks.postcode = isValidPostcode
  }
}

function isValidAddress(addressObj) {
  const localAddressFieldChecks = Object.assign({}, addressFieldChecks)

  setUpPostCodeChecks(addressObj, localAddressFieldChecks)

  const addressErrors = _.reduce(localAddressFieldChecks, (errors, checkFn, memberFieldKey) => {
    if (!addressObj || !checkFn(addressObj[memberFieldKey])) {
      errors.push(memberFieldKey)
    }
    return errors
  }, [])

  if (addressErrors.length > 0){
    return _.map(addressErrors, error => {
      return `residential${_.capitalize(error)}`
    })
  }
  return []
}

function isValidPostalAddress(addressObj) {
  const localAddressFieldChecks = Object.assign({}, addressFieldChecks)

  setUpPostCodeChecks(addressObj, localAddressFieldChecks)

  const addressErrors = _.reduce(localAddressFieldChecks, (errors, checkFn, memberFieldKey) => {
    if (!addressObj || !checkFn(addressObj[memberFieldKey])) {
      errors.push(memberFieldKey)
    }
    return errors
  }, [])

  if (addressErrors.length > 0){
    return _.map(addressErrors, error => {
      return `postal${_.capitalize(error)}`
    })
  }
  return []
}

function isValidDetails(member) {
  return _.reduce(memberFieldsChecks, (errors, checkFn, memberFieldKey) => {
    if (!member || !checkFn(member[memberFieldKey])){
      errors.push(memberFieldKey)
    }
    return errors
  }, [])
}

function isValidServerDetails(member) {
  const checks = Object.assign({}, memberFieldsChecks, {dateOfBirth: isValidServerDate})

  return _.reduce(checks, (errors, checkFn, memberFieldKey) => {
    if (!member || !checkFn(member[memberFieldKey])){
      errors.push(memberFieldKey)
    }
    return errors
  }, [])
}

function isValidImportDetails(member) {
  // Special validator for importing member data, works around piratedb dob reqs by... ignoring them.
  const checks = Object.assign({}, memberFieldsChecks, {dateOfBirth: isValidImportDate})

  return _.reduce(checks, (errors, checkFn, memberFieldKey) => {
    if (!member || !checkFn(member[memberFieldKey])){
      errors.push(memberFieldKey)
    }
    return errors
  }, [])
}


function isValidMembershipType(type) {
  const validOptions = ["full", "permanentResident", "supporter", "internationalSupporter"]

  return validOptions.indexOf(type) !== -1
}

function isValid(member) {
  const errors = [
    isValidDetails(member),
    isValidAddress(member && member.residentialAddress),
    isValidPostalAddress(member && member.postalAddress)
  ]

  return _.flatten(errors)
}

function isValidServer(member) {
  const errors = [
    isValidServerDetails(member),
    isValidAddress(member && member.residentialAddress),
    isValidPostalAddress(member && member.postalAddress)
  ]

  return _.flatten(errors)
}

function isValidImport(member) {
  const errors = [
    isValidImportDetails(member),
    isValidAddress(member && member.residentialAddress),
    isValidPostalAddress(member && member.postalAddress)
  ]

  return _.flatten(errors)
}

function isValidPassword(password) {
  if (!password || password.length < 8){
    return false
  }

  return true
}

function isValidWithPasswords(member, password, confirmPassword) {
  let errors = isValid(member)

  if (!isValidPassword(password)){
    errors.push('password')
  }

  if (password !== confirmPassword){
    errors.push('confirmPassword')
  }

  return errors
}

module.exports = {
  isValidName,
  isValidGender,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValid,
  isValidServer,
  isValidImport,
  isValidPassword,
  isValidWithPasswords,
  isValidAddress,
  isValidMembershipType,
  isValidVerificationHash
}
