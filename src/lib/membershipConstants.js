/* eslint-disable no-inline-comments */
/**
 * Created by thomas on 2017-01-16.
 */

const MEMBERSHIP_TYPES = {
  full: "full",
  permanentResident: "permanentResident",
  supporter: "supporter",
  internationalSupporter: "internationalSupporter",
}

const MEMBERSHIP_STATUSES = {
  pending: "pending", // The membership application has been submitted, not approved.
  rejected: "rejected", // Member application was rejected for some reason.
  accepted: "accepted", // Member application approved by whomever.
  resigned: "resigned", // Member has resigned.
  suspended: "suspended", // Member is suspended.
  expelled: "expelled", // Member was expelled.
}

module.exports = { MEMBERSHIP_TYPES, MEMBERSHIP_STATUSES }
