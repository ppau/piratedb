'use strict';

const config = require("../config")
const defaultFrom = !!config.email.from ? config.email.from : 'blackhole@example.com'

// Non-tabbed formatting of body string sections below is very important.

const defaultEmails = {
  applicationReceived: {
    name: "applicationReceived",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Membership application received",
    body: `### Membership application received

Hello <%= firstName %>,

Thank you for applying for membership of <%= organisationName %>!

Your application will be reviewed by the Party Secretariat shortly.

You can start participating immediately though, our organisation is made up entirely by our members and volunteers, without whom nothing would happen.

### Let's begin:

@[Getting started](<%= wwwPublicUrl %>/on-board)

Regards,

<%= organisationName %>`
  },
  applicationAccepted: {
    name: "applicationAccepted",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Membership application approved",
    body: `# Congratulations!

## You are now a member of <%= organisationName %>!

You can start participating right now, by getting involved with our activities and helping build a new political movement in Australia.

### Let's begin:

@[Getting started](<%= wwwPublicUrl %>/on-board)

You can manage your membership and donations in our members area:

@[Visit the members area](<%= piratedbPublicUrl %>)

Regards,

<%= organisationName %>`
  },
  verifyEmail: {
    name: "verifyEmail",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Verify your email",
    body: `## Verify your email

Hello <%= firstName %>,

Thank you for your membership application to the <%= organisationName %>.

To make sure we can always reach you, please verify your email address by clicking on the link below.

@[Verify your email](<%= piratedbPublicUrl %>/members/verify/<%= memberId %>/<%= verificationHash %>)

Should you have any issues or concerns, please do not hesitate to contact us at <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  },
  memberRenewalSuccessful: {
    name: "memberRenewalSuccessful",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Membership renewal successful",
    body: `## Membership renewed

Hello <%= firstName %>,

Your <%= organisationName %> membership has been renewed!

Once again we thank you for your support!

Regards,

<%= organisationName %>`
  },
  memberRenewalReminder: {
    name: "memberRenewalReminder",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Renew your membership",
    body: `## Renew your membership

Hello <%= firstName %>,

Your <%= organisationName %> membership is due to expire <%= remainderPeriod %>. To renew it, please sign in to our members area by following the link below:

@[Renew your membership](<%= piratedbPublicUrl %>/account/renew/)

Once again we thank you for your support!

Should you have any questions or concerns, do not hesitate to contact us at <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  },
  memberExpiredReminder: {
    name: "memberExpiredReminder",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Renew your membership",
    body: `## Renew your membership

Hello <%= firstName %>,

Your <%= organisationName %> membership now needs to be renewed. To renew it, please sign in to our members area by following the link below:

@[Renew your membership](<%= piratedbPublicUrl %>/account/renew/)

Once again we thank you for your support!

Should you have any questions or concerns, do not hesitate to contact us at <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  },
  userPasswordChanged: {
    name: "userPasswordChanged",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Account password changed",
    body: `## Account password changed

Hello <%= firstName %>,

This email is to let you know your account password for our members area was changed.

If this wasn't you, please contact us immediately at: <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  }, memberApplicationSecretaryNotification: {
    name: "memberApplicationSecretaryNotification",
    isMarkDown: true,
    from: defaultFrom,
    subject: "New application received",
    body: `Hello Secretariat,

A new member application requires your approval or referral to the National Council.

* Name: <%= givenNames %> <%= surname %>
* Email: <%= email %>
* State: <%= state %>
* Membership type: <%= type %>

@[Review application](<%= piratedbPublicUrl %>/admin/secretary/member-view/<%= memberId %>)

`
  }, importedUserPasswordResetKey: {
    name: "importedUserPasswordResetKey",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - New account password information",
    body: `Hello <%= firstName %>,

A new account has been created for you to manage your <%= organisationName %> membership.

The process is simple and only requires that you pick a strong new password at the below link before you can sign in.

@[Set your password](<%= piratedbPublicUrl %>/imported-member-password-change/<%= resetPasswordKey %>/<%= username %>)

If you have any questions, please contact us at: <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  }, importedUserPasswordResetKeyReminder: {
    name: "importedUserPasswordResetKeyReminder",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - New account information reminder",
    body: `Hello <%= firstName %>,

We would like to remind you that we have created a new account for you in our new members area to help you renew and keep your <%= organisationName %> membership up to date.

The process is simple and only requires that you pick a strong new password at the below link before you can sign in.

@[Set your password](<%= piratedbPublicUrl %>/imported-member-password-change/<%= resetPasswordKey %>/<%= username %>)

## AEC Audit

While you're here, we're asking all Full members to update their details, as we have been notified by the AEC of another audit, which requires us to prove our membership to the AEC again. This is required for us to remain registered to run in federal elections.

Please follow the instructions below:

* Check your enrolment record with the AEC is correct, by visiting [https://check.aec.gov.au/](https://check.aec.gov.au/)
* Sign in to our new members platform, by using the [Set your password](<%= piratedbPublicUrl %>/imported-member-password-change/<%= resetPasswordKey %>/<%= username %>) link
* Check that your personal details in our members area exactly matches your enrolment record at the AEC (including your address and middle name/s)
* Renew your membership if required
* Make a small donation if you are able to

If you have any questions, please contact us at: [membership@pirateparty.org.au](mailto:membership@pirateparty.org.au)

Regards,

<%= organisationName %>

Note: This email was sent because you are a member of Pirate Party Australia. If you no longer wish to hear from us, you can resign your membership by requesting it in writing to [secretary@pirateparty.org.au](mailto:secretary@pirateparty.org.au)
`
  }, forgottenPasswordResetKey: {
    name: "forgottenPasswordResetKey",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Account password reset information",
    body: `Hello <%= firstName %>,

A request has been made to reset your password, to complete a password reset please complete the form at the below link.

@[Change your password](<%= piratedbPublicUrl %>/forgotten-password-change/<%= resetPasswordKey %>/<%= username %>)

If this wasn't you, please contact us immediately at: <%= organisationFromEmail %>

`
  }, forgottenPasswordUserNotFound: {
    name: "forgottenPasswordUserNotFound",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Account password reset information",
    body: `Hello,

A request has been made to reset your password for an account with this email address.

Unfortunately we could not find any accounts with this email address, maybe you used a different email address.

If you need help you can contact us at: <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  }, donationReferenceNumber: {
    name: "donationReferenceNumber",
    isMarkDown: true,
    from: defaultFrom,
    subject: "<%= organisationName %> - Donation reference number",
    body: `Hello,

Your reference number for your recent donation is: <%= referenceNumber %>

Please quote it in the description of your cheque or direct debit transaction.

If you need help you can contact us at: <%= organisationFromEmail %>

Regards,

<%= organisationName %>`
  }
}

module.exports = {
  defaultEmails
}
