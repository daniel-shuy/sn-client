import CssBaseline from '@material-ui/core/CssBaseline'
import React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter, Route } from 'react-router-dom'
import { DesktopLayout } from './components/layout/DesktopLayout'
import { MainRouter } from './components/MainRouter'
import {
  ContentRoutingContextProvider,
  InjectorContext,
  LocalizationProvider,
  PersonalSettingsContextProvider,
  RepositoryContextProvider,
  ResponsiveContextProvider,
  SessionContextProvider,
  ThemeProvider,
} from './context'
import { CommandProviderManager } from './services/CommandProviderManager'
import { CheatCommandProvider } from './services/CommandProviders/CheatCommandProvider'
import { HelpCommandProvider } from './services/CommandProviders/HelpCommandProvider'
import { HistoryCommandProvider } from './services/CommandProviders/HistoryCommandProvider'
import { InFolderSearchCommandProvider } from './services/CommandProviders/InFolderSearchCommandProvider'
import { QueryCommandProvider } from './services/CommandProviders/QueryCommandProvider'
import { diMiddleware, store } from './store'
import './style.css'
import theme from './theme'
import './utils/InjectorExtensions'

// tslint:disable-next-line: no-string-literal
const injector = diMiddleware['injector']

diMiddleware
  .getInjectable(CommandProviderManager)
  .RegisterProviders(
    CheatCommandProvider,
    HelpCommandProvider,
    HistoryCommandProvider,
    InFolderSearchCommandProvider,
    QueryCommandProvider,
  )

ReactDOM.render(
  <CssBaseline>
    <Provider store={store}>
      <InjectorContext.Provider value={injector}>
        <PersonalSettingsContextProvider>
          <LocalizationProvider>
            <HashRouter>
              <Route path="/:repo?">
                <RepositoryContextProvider>
                  <ContentRoutingContextProvider>
                    <SessionContextProvider>
                      <ResponsiveContextProvider>
                        <ThemeProvider theme={theme}>
                          <DesktopLayout>
                            <MainRouter />
                          </DesktopLayout>{' '}
                        </ThemeProvider>
                      </ResponsiveContextProvider>
                    </SessionContextProvider>
                  </ContentRoutingContextProvider>
                </RepositoryContextProvider>
              </Route>
            </HashRouter>
          </LocalizationProvider>
        </PersonalSettingsContextProvider>
      </InjectorContext.Provider>
    </Provider>
  </CssBaseline>,
  document.getElementById('root'),
)