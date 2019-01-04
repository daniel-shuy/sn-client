import * as React from 'react'
import { Provider } from 'react-redux'
import * as renderer from 'react-test-renderer'
import { Page } from '../src/components/Page'
import { documentReceivedAction } from '../src/store/Document'
import { exampleDocumentData, useTestContext } from './__Mocks__/viewercontext'

/**
 * Page Component tests
 */
describe('Page component', () => {
  let c!: renderer.ReactTestRenderer

  afterEach(() => {
    c.unmount()
  })

  it('Should render without crashing', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      c = renderer.create(
        <Provider store={ctx.store}>
          <Page
            onClick={() => undefined}
            imageIndex={1}
            image={{} as any}
            elementNamePrefix={'EL'}
            zoomMode={'fit'}
            zoomLevel={0}
            viewportWidth={1024}
            viewportHeight={768}
            showWidgets={true}
            margin={8}
            fitRelativeZoomLevel={0}
          />
        </Provider>,
      )
    })
  })
})