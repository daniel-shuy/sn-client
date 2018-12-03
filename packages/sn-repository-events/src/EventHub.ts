import {
  Content,
  CopyOptions,
  DeleteOptions,
  PatchOptions,
  PostOptions,
  PutOptions,
  Repository,
} from '@sensenet/client-core'
import { ObservableValue, Trace } from '@sensenet/client-utils'
import { Disposable } from '@sensenet/client-utils/dist/Disposable'
import {
  ContentCopied,
  ContentCopyFailed,
  ContentMoved,
  ContentMoveFailed,
  Created,
  CreateFailed,
  CustomActionExecuted,
  CustomActionFailed,
  Deleted,
  DeleteFailed,
  Loaded,
  ModificationFailed,
  Modified,
} from './EventModels'

/**
 * Event hub for sensenet Repository Events
 */
export class EventHub implements Disposable {
  /**
   * Disposes the event hub and all of its ObservableValues
   */
  public dispose() {
    for (const key in this) {
      if (this.hasOwnProperty(key) && typeof (this[key] as any).dispose === 'function') {
        ;(this[key] as any).dispose()
      }
    }
  }
  /**
   * Triggered after a succesful Content creation
   */
  public readonly onContentCreated = new ObservableValue<Created>()

  /**
   * Triggered after Content creation has been failed
   */
  public readonly onContentCreateFailed = new ObservableValue<CreateFailed>()
  /**
   * Triggered after modifying a Content
   */

  public readonly onContentModified = new ObservableValue<Modified>()
  /**
   * Triggered when failed to modify a Content
   */
  public readonly onContentModificationFailed = new ObservableValue<ModificationFailed>()

  /**
   * Triggered when a Content is loaded from the Repository
   */
  public readonly onContentLoaded = new ObservableValue<Loaded>()

  /**
   * Triggered after deleting a Content
   */
  public readonly onContentDeleted = new ObservableValue<Deleted>()

  /**
   * Triggered after deleting a content has been failed
   */
  public readonly onContentDeleteFailed = new ObservableValue<DeleteFailed>()

  /**
   * Triggered after a custom OData Action has been executed
   */
  public readonly onCustomActionExecuted = new ObservableValue<CustomActionExecuted<Content>>()
  /**
   * Triggered after a custom OData Action has been failed
   */
  public readonly onCustomActionFailed = new ObservableValue<CustomActionFailed<Content>>()

  /**
   * Triggered after moving a content to another location
   */
  public readonly onContentMoved = new ObservableValue<ContentMoved>()

  /**
   * Triggered after moving a content has been failed
   */
  public readonly onContentMoveFailed = new ObservableValue<ContentMoveFailed>()

  /**
   * Triggered after copying a content to another location
   */
  public readonly onContentCopied = new ObservableValue<ContentCopied>()

  /**
   * Triggered after copying a content has been failed
   */
  public readonly onContentCopyFailed = new ObservableValue<ContentCopyFailed>()

  // ToDo
  // private readonly onUploadProgressObservableValue = new ObservableValue<UploadProgressInfo<IContent>>();

  constructor(private readonly repository: Repository) {
    this.initializeMappings()
  }

  private traceObservers: Disposable[] = []
  private initializeMappings() {
    this.traceObservers.push(
      Trace.method({
        object: this.repository,
        method: this.repository.post,
        isAsync: true,
        // Post finished to Content Create
        onFinished: async finished => {
          const response = await finished.returned
          const content = response.d
          this.onContentCreated.setValue({
            content: content as Content,
          })
        },
        // Post errored to content create failed
        onError: err => {
          this.onContentCreateFailed.setValue({
            content: (err.arguments[0] as PostOptions<Content>).content as Content,
            error: err.error,
          })
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.patch,
        isAsync: true,
        // Patch finished to ContentModified
        onFinished: async finished => {
          const response = await finished.returned
          this.onContentModified.setValue({
            changes: (finished.arguments[0] as PatchOptions<Content>).content as Content,
            content: response.d as Content,
          })
        },
        // Patch error to ContentModificationFailed
        onError: error => {
          this.onContentModificationFailed.setValue({
            content: (error.arguments[0] as PatchOptions<Content>).content as Content,
            error: error.error,
          })
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.put,
        isAsync: true,
        // Put finished to ContentModified
        onFinished: async finished => {
          const response = await finished.returned
          this.onContentModified.setValue({
            changes: (finished.arguments[0] as PutOptions<Content>).content as Content,
            content: response.d as Content,
          })
        },
        // Patch error to ContentModificationFailed
        onError: error => {
          this.onContentModificationFailed.setValue({
            content: (error.arguments[0] as PutOptions<Content>).content as Content,
            error: error.error,
          })
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.delete,
        isAsync: true,
        // handle DeleteBatch finished based on the response value
        onFinished: async finished => {
          const response = await finished.returned
          if (response.d.results.length) {
            for (const deleted of response.d.results) {
              this.onContentDeleted.setValue({
                permanently: (finished.arguments[0] as DeleteOptions).permanent || false,
                contentData: deleted as Content,
              })
            }
          }

          if (response.d.errors.length) {
            for (const failed of response.d.errors) {
              this.onContentDeleteFailed.setValue({
                permanently: (finished.arguments[0] as DeleteOptions).permanent || false,
                content: failed.content as Content,
                error: failed.error,
              })
            }
          }
        },
        // Handle DeleteBatch errors
        onError: error => {
          let contentArgs: Array<string | number> = (error.arguments[0] as DeleteOptions).idOrPath as any
          if (!(contentArgs instanceof Array)) {
            contentArgs = [contentArgs]
          }
          const contents = contentArgs.map(v => {
            return isNaN(v as number) ? { Path: v } : ({ Id: parseInt(v as string, 10) } as Content)
          })
          for (const c of contents) {
            this.onContentDeleteFailed.setValue({
              content: c as Content,
              permanently: (error.arguments[0] as DeleteOptions).permanent || false,
              error: error.error,
            })
          }
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.copy,
        isAsync: true,
        // handle CopyBatch finished based on the response value
        onFinished: async finished => {
          const response = await finished.returned
          if (response.d.results.length) {
            for (const copied of response.d.results) {
              this.onContentCopied.setValue({
                content: copied as Content,
                originalContent: finished.arguments[0].idOrPath,
              })
            }
          }

          if (response.d.errors.length) {
            for (const failed of response.d.errors) {
              this.onContentCopyFailed.setValue({
                content: failed.content as Content,
                error: failed.error,
              })
            }
          }
        },
        // Handle CopyBatch errors
        onError: error => {
          let contentArgs: Array<string | number> = (error.arguments[0] as CopyOptions).idOrPath as any
          if (!(contentArgs instanceof Array)) {
            contentArgs = [contentArgs]
          }
          const contents = contentArgs.map(v => {
            return isNaN(v as number) ? { Path: v } : ({ Id: parseInt(v as string, 10) } as Content)
          })
          for (const c of contents) {
            this.onContentCopyFailed.setValue({
              content: c as Content,
              error: error.error,
            })
          }
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.move,
        isAsync: true,
        // handle MoveBatch finished based on the response value
        onFinished: async finished => {
          const response = await finished.returned
          if (response.d.results.length) {
            for (const copied of response.d.results) {
              this.onContentMoved.setValue({
                content: copied as Content,
              })
            }
          }

          if (response.d.errors.length) {
            for (const failed of response.d.errors) {
              this.onContentMoveFailed.setValue({
                content: failed.content as Content,
                error: failed.error,
              })
            }
          }
        },
        // Handle MoveBatch errors
        onError: error => {
          let contentArgs: Array<string | number> = (error.arguments[0] as DeleteOptions).idOrPath as any
          if (!(contentArgs instanceof Array)) {
            contentArgs = [contentArgs]
          }
          const contents = contentArgs.map(v => {
            return isNaN(v as number) ? { Path: v } : ({ Id: parseInt(v as string, 10) } as Content)
          })
          for (const c of contents) {
            this.onContentMoveFailed.setValue({
              content: c as Content,
              error,
            })
          }
        },
      }),
      Trace.method({
        object: this.repository,
        method: this.repository.executeAction,
        isAsync: true,
        onFinished: async finished => {
          this.onCustomActionExecuted.setValue({
            actionOptions: finished.arguments[0],
            oDataParams: finished.arguments[0].oDataOptions,
            result: finished.returned,
          })
        },
        onError: async error => {
          this.onCustomActionFailed.setValue({
            actionOptions: error.arguments[0],
            error: error.error,
            oDataParams: error.arguments[0].oDataOptions,
          })
        },
      }),
    )
  }
}