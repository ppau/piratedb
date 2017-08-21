import * as actionTypes from '../constants/administrationActionTypes'
import { promiseDispatchFactory } from '../utils/actions'

/*
* Update member
*/
export function updateMemberPending(payload) {
  return {
    type: actionTypes.UPDATE_MEMBER_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function updateMemberFulfilled(payload, response) {
  return {
    type: actionTypes.UPDATE_MEMBER_FULFILLED,
    status: response.status === 200 ? "success" : "error",
    payload: payload,
  }
}

export function updateMemberRejected(error) {
  return {
    type: actionTypes.UPDATE_MEMBER_REJECTED,
    status: "error",
    payload: {
      errors: [
        "A server error occurred."
      ]
    },
  }
}

export function executeUpdateMember(payload) {
  const params = {
    url: `/admin/members/${payload.data.member.id}`,
    payload: payload,
    pending: updateMemberPending,
    fulfilled: updateMemberFulfilled,
    rejected: updateMemberRejected,
  }

  return promiseDispatchFactory(params)
}

/*
* Create user for member
*/
export function createUserForMemberPending(payload) {
  return {
    type: actionTypes.CREATE_USER_FOR_MEMBER_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function createUserForMemberFulfilled(payload, response) {
  return {
    type: actionTypes.CREATE_USER_FOR_MEMBER_FULFILLED,
    status: response.status === 200 ? "success" : "error",
    payload: payload,
  }
}

export function createUserForMemberRejected(error) {
  return {
    type: actionTypes.CREATE_USER_FOR_MEMBER_REJECTED,
    status: "error",
    payload: {
      errors: [
        "A server error occurred."
      ]
    },
  }
}

export function executeCreateUserForMember(payload) {
  const params = {
    url: `/admin/members/create-user/${payload.data.memberId}`,
    payload: payload,
    pending: createUserForMemberPending,
    fulfilled: createUserForMemberFulfilled,
    rejected: createUserForMemberRejected,
  }

  return promiseDispatchFactory(params)
}

/*
* Toggle user enabled/disabled
*/
export function toggleUserEnabledPending(payload) {
  return {
    type: actionTypes.TOGGLE_USER_ENABLED_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function toggleUserEnabledFulfilled(payload, response) {
  return {
    type: actionTypes.TOGGLE_USER_ENABLED_FULFILLED,
    status: response.status === 200 ? "success" : "error",
    payload: payload,
  }
}

export function toggleUserEnabledRejected(error) {
  return {
    type: actionTypes.TOGGLE_USER_ENABLED_REJECTED,
    status: "error",
    payload: {
      errors: [
        "A server error occurred."
      ]
    },
  }
}

export function executeToggleUserEnabled(payload) {
  const params = {
    url: `/admin/users/toggle-enabled/${payload.data.userId}`,
    payload: payload,
    pending: toggleUserEnabledPending,
    fulfilled: toggleUserEnabledFulfilled,
    rejected: toggleUserEnabledRejected,
  }

  return promiseDispatchFactory(params)
}

/*
* Load member application statistics
*/
export function statisticsPending(payload) {
  return {
    type: actionTypes.MEMBER_STATISTICS_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function statisticsFulfilled(payload, response) {
  return {
    type: actionTypes.MEMBER_STATISTICS_FULFILLED,
    status: response.status === 200 ? "success" : "error",
    payload: payload,
  }
}

export function statisticsRejected(error) {
  return {
    type: actionTypes.MEMBER_STATISTICS_REJECTED,
    status: "error",
    payload: {
      errors: [
        "A server error occurred."
      ]
    },
  }
}

export function executeLoadStatistics() {
  const params = {
    url: `/admin/statistics`,
    payload: null,
    pending: statisticsPending,
    fulfilled: statisticsFulfilled,
    rejected: statisticsRejected,
    method: 'GET',
  }

  return promiseDispatchFactory(params)
}
