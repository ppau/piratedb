/**
 * This is the front end entry point, it:
 *  - includes some libs for webpack
 *  - creates the app store and fires up our routes
 */


import React from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import injectTapEventPlugin from 'react-tap-event-plugin'

import env from './utils/env'
import reducers from './reducers/index'

import AppContainer from './containers/AppContainer.jsx'

// Needed for onTouchTap
injectTapEventPlugin();

String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// webpack includes for bundling
import '../../node_modules/react-mdl/extra/material'

const history = createHistory()
const historyMiddleware = routerMiddleware(history)

const middleware = [
  thunk,
  historyMiddleware
]

if (env.NODE_ENV !== "production") {
  middleware.push(createLogger())
}

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer,
  }),
  applyMiddleware(...middleware)
)

render((
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AppContainer />
    </ConnectedRouter>
  </Provider>
), document.getElementById('app'))
