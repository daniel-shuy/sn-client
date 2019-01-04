import * as React from 'react'
import { Provider } from 'react-redux'
import * as renderer from 'react-test-renderer'
import { ShapeAnnotation, ShapeHighlight } from '../src/components/page-widgets/Shape'
import { ShapesWidget } from '../src/components/page-widgets/Shapes'
import { documentPermissionsReceived, documentReceivedAction } from '../src/store/Document'
import { availabelImagesReceivedAction } from '../src/store/PreviewImages'
import { exampleDocumentData, useTestContext } from './__Mocks__/viewercontext'

/**
 * Shapes widget tests
 */
describe('ShapesWidget component', () => {
  let c!: renderer.ReactTestRenderer

  afterEach(() => {
    c.unmount()
  })

  it('Should render without crashing', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )
    })
  })

  it('Delete should remove shapes', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(documentPermissionsReceived(true, true, true))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )

      const highlight = c.root.findByType(ShapeHighlight).children[0] as any
      const guid = highlight.props.shape.guid
      highlight.instance.state.handleKeyPress({ key: 'Delete' }, highlight.instance.props.shape)
      expect(
        ctx.store
          .getState()
          .sensenetDocumentViewer.documentState.document.shapes.annotations.find(s => s.guid === guid),
      ).toBe(undefined)
    })
  })

  it("Delete shouldn't remove the annotation shape", () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(documentPermissionsReceived(true, true, true))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )

      const annotation = c.root.findByType(ShapeAnnotation).children[0] as any
      const guid = annotation.props.shape.guid
      annotation.instance.state.handleKeyPress({ key: 'Delete' }, annotation.instance.props.shape)
      expect(
        ctx.store
          .getState()
          .sensenetDocumentViewer.documentState.document.shapes.annotations.find(s => s.guid === guid),
      ).toBeTruthy()
    })
  })

  it('Focus and blur should update the focused state property', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(documentPermissionsReceived(true, true, true))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )

      const annotation = c.root.findByType(ShapeAnnotation).children[0] as any
      expect(annotation.instance.state.focused).toBe(false)

      // focus
      annotation.instance.state.onFocus()
      expect(annotation.instance.state.focused).toBe(true)

      // focus on child
      annotation.instance.state.onBlur({ currentTarget: { contains: () => true, innerText: ' a ' }, nativeEvent: {} })
      expect(annotation.instance.state.focused).toBe(true)

      // blur
      annotation.instance.state.onBlur({ currentTarget: { contains: () => false, innerText: ' a ' }, nativeEvent: {} })
      expect(annotation.instance.state.focused).toBe(false)

      // annotation text should be updated and trimmed
      expect(annotation.instance.props.shape.text).toBe('a')
    })
  })

  it('Resized should update the shape data', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(documentPermissionsReceived(true, true, true))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )

      const annotation = c.root.findByType(ShapeAnnotation).children[0] as any
      expect(annotation.instance.state.focused).toBe(false)

      // resize
      annotation.instance.state.onResized(
        { currentTarget: { getBoundingClientRect: () => ({ widt: 10, height: 10 }) } },
        'annotations',
        annotation.instance.props.shape,
      )
    })
  })

  it('onDragStart should add shape data to dataTransfer', () => {
    useTestContext(ctx => {
      ctx.store.dispatch(documentReceivedAction(exampleDocumentData))
      ctx.store.dispatch(documentPermissionsReceived(true, true, true))
      ctx.store.dispatch(
        availabelImagesReceivedAction([
          {
            Attributes: {
              degree: 0,
            },
            Index: 1,
            Height: 100,
            Width: 100,
          },
        ]),
      )
      const page = ctx.store.getState().sensenetDocumentViewer.previewImages.AvailableImages[0]
      c = renderer.create(
        <Provider store={ctx.store}>
          <ShapesWidget page={page} viewPort={{ width: 1024, height: 768 }} zoomRatio={1} />
        </Provider>,
      )

      const annotation = c.root.findByType(ShapeAnnotation).children[0] as any
      expect(annotation.instance.state.focused).toBe(false)

      // onDragStart
      annotation.instance.state.onDragStart(
        {
          dataTransfer: {
            setData: (key: string, value: string) => {
              expect(key).toBe('shape')
              expect(typeof value).toBe('string')
              /** */
            },
          },
          currentTarget: {
            getBoundingClientRect: () => ({ top: 5, left: 5, width: 100, height: 100 }),
          },
        },
        'annotations',
        annotation.instance.props.shape,
      )
    })
  })
})