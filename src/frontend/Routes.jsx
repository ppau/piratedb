import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import ConnectedRouterSwitch from './components/ConnectedRouterSwitch.jsx'

// Test
import Finished from './components/Finished.jsx'
// EndTest imports

import LandingPageContainer from './containers/LandingPageContainer.jsx'

import ForgottenPasswordChangePageContainer from './containers/ForgottenPasswordChangePageContainer.jsx'
import ImportedMemberPasswordChangePageContainer from './containers/ImportedMemberPasswordChangePageContainer.jsx'

// Pages
import DonatePageContainer from './containers/DonatePageContainer.jsx'
import ChatPage from './pages/ChatPage.jsx'
import DiscussionForumPage from './pages/DiscussionForumPage.jsx'

import NewMemberForm from './components/NewMemberForm.jsx'

// Account import
import NotificationsPage from './pages/NotificationsPage.jsx'
import AccountVerificationPageContainer from './containers/AccountVerificationPageContainer.jsx'
import MemberDetailsViewPageContainer from './containers/MemberDetailsViewPageContainer.jsx'
import MemberDetailsUpdatePageContainer from './containers/MemberDetailsUpdatePageContainer.jsx'
import MemberRenewPageContainer from './containers/MemberRenewPageContainer.jsx'

// Admin imports
import Secretary from './components/administration/Secretary.jsx'
import Treasurer from './components/administration/Treasurer.jsx'
import Audit from './components/administration/Audit.jsx'
import Users from './components/administration/Users.jsx'
import AdminMemberDetailsViewPage from './pages/administration/AdminMemberDetailsViewPage.jsx'
import AdminMemberDetailsUpdatePage from './pages/administration/AdminMemberDetailsUpdatePage.jsx'
import AdminDashboardPageContainer from './containers/AdminDashboardPageContainer.jsx'

import RoadmapPage from './pages/RoadmapPage.jsx'

export default class Routes extends Component {
  render() {
    return (
      <ConnectedRouterSwitch>
        <Route exact path="/" component={ LandingPageContainer }/>
        <Route path="/test" component={ Finished }/>
        <Route exact path="/sign-in" component={ LandingPageContainer }/>
        <Route exact path="/forgotten-password" component={ LandingPageContainer }/>
        <Route exact path="/forgotten-password-change/:resetPasswordKey/:username" component={ ForgottenPasswordChangePageContainer }/>
        <Route exact path="/imported-member-password-change/:resetPasswordKey/:username" component={ ImportedMemberPasswordChangePageContainer }/>

        // non-authed member views
        <Route path="/members/new" component={ NewMemberForm }/>
        <Route path="/members/verify/:id/:hash" component={ AccountVerificationPageContainer }/>

        // authed member views
        <Route exact path="/account" component={ MemberDetailsViewPageContainer }/>
        <Route exact path="/account/details" component={ MemberDetailsViewPageContainer }/>
        <Route exact path="/account/update" component={ MemberDetailsUpdatePageContainer }/>
        <Route exact path="/account/renew" component={ MemberRenewPageContainer }/>
        <Route exact path="/account/notifications" component={ NotificationsPage }/>

        // admin views
        <Route exact path="/admin" component={ AdminDashboardPageContainer }/>
        <Route path="/admin/dashboard" component={ AdminDashboardPageContainer }/>

        <Route exact path="/admin/secretary" component={ Secretary }/>
        <Route path="/admin/secretary/member-view/:id" component={ AdminMemberDetailsViewPage }/>
        <Route path="/admin/secretary/member-update/:id" component={ AdminMemberDetailsUpdatePage }/>

        <Route exact path="/admin/treasurer" component={ Treasurer }/>
        <Route exact path="/admin/users" component={ Users }/>
        <Route exact path="/admin/audit" component={ Audit }/>

        // Pages
        <Route exact path="/donate" component={ DonatePageContainer }/>

        <Route exact path="/chat" component={ ChatPage } />
        <Route exact path="/discussion-forum" component={ DiscussionForumPage }/>

        // Roadmap pages
        <Route exact path="/local-crews" component={ RoadmapPage }/>
        <Route exact path="/events" component={ RoadmapPage }/>
        <Route exact path="/volunteer" component={ RoadmapPage }/>
        <Route exact path="/elections" component={ RoadmapPage }/>
        <Route exact path="/crowdfund" component={ RoadmapPage }/>
        <Route exact path="/store" component={ RoadmapPage }/>
      </ConnectedRouterSwitch>
    )
  }
}
