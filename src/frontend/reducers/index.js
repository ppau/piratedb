import auth from './auth'
import verification from './verification'
import administration from './administration'
import administrationCreateUserForMember from './administrationCreateUserForMember'
import administrationToggleUserEnabled from './administrationToggleUserEnabled'
import administrationStatistics from './administrationStatistics'
import memberChangePassword from './memberChangePassword'
import forgottenPassword from './forgottenPassword'
import forgottenPasswordChange from './forgottenPasswordChange'

const reducers = {
  auth: auth,
  verification: verification,
  memberChangePassword: memberChangePassword,
  administration: administration,
  administrationCreateUserForMember: administrationCreateUserForMember,
  administrationToggleUserEnabled: administrationToggleUserEnabled,
  administrationStatistics: administrationStatistics,
  forgottenPassword: forgottenPassword,
  forgottenPasswordChange: forgottenPasswordChange,
}

export default reducers
