import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  MemoryRouter
} from 'react-router-dom'
import { Store, Actions, Reducers } from 'sn-redux'
import { Repository, Content, ContentTypes } from 'sn-client-js'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux';
import 'rxjs'
import SimpleTableRow from '../SimpleTableRow';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const sensenet = Reducers.sensenet;
  const myReducer = combineReducers({ sensenet })

  const repository = new Repository.SnRepository({
    RepositoryUrl: process.env.REACT_APP_SERVICE_URL || 'https://dmsservice.demo.sensenet.com',
    RequiredSelect: ['Id', 'Path', 'Name', 'Type', 'ParentId']
  });

  repository.Config
  const store = Store.configureStore(myReducer, null, undefined, {
    sensenet: {
      session: {
        repository: {
          RepositoryUrl
          :
          'https://dmsservice.demo.sensenet.com'
        }
      },
      children: {
        entities: {
          123: {
            Id: 123
          }
        }
      }
    }
  }, repository)

  const content = Content.Create({ DisplayName: 'My content', Id: 123, Path: '/workspaces' }, ContentTypes.Task, repository);
  ReactDOM.render(
    <MemoryRouter>
      <Provider store={store}>
        <SimpleTableRow store={store} content={content} />
      </Provider>
    </MemoryRouter>, div);
});