/**
 * The @qx.bom.rest@ package consists of only one class: {@link Resource}.
 *
 * {@link Resource} allows to encapsulate the specifics of a REST interface.
 * Rather than requesting URLs with a specific HTTP method manually, a resource
 * representing the remote resource is instantiated and actions are invoked on this resource.
 * A resource with its actions can be configured declaratively or programmatically.
 *
 * There is also {@link qx.io.rest.Resource} which uses {@link Resource} under the hood.
 * The main differences between them are:
 *
 * * The event object available in the listeners (e.g. @success()@, @getSuccess()@ and @getError()@) is
 *   a native JavaScript object instead of a qooxdoo object ({@link qx.event.type.Rest}):
 * ** See {@link qx.io.rest.Resource} vs. {@link Resource}
 * ** @event.getId()@ => @event.id@
 * ** @event.getRequest()@ => @event.request@
 * ** @event.getAction()@ => @event.action@
 * ** @event.getData()@ => @event.response@
 * ** @event.getPhase()@ => @---@ (see below)
 * * Methods which allow request manipulation (e.g. @configureRequest()@) will operate on an
 *   instance of {@link qx.bom.request.SimpleXhr} instead of {@link qx.io.request.Xhr}
 *   (their API is similar but not identical)
 * * The method @poll()@ returns no {@link qx.event.Timer} object. There are two new methods
 *   (@stopPollByAction()@ and @restartPollByAction()@) available at {@link Resource}
 *   which replace the functionality provided by the Timer object.
 * * The phase support, which is a more elaborate version of readyState, is not available.
 *   So use readyState instead.
 * ** Phases (available only in {@link qx.io.rest.Resource}):
 * *** @unsent@, @opened@, @sent@, @loading@, @load@, @success@
 * *** @abort@, @timeout@, @statusError@
 * ** readyState (available in {@link Resource} and {@link qx.io.rest.Resource}):
 * *** @UNSENT@
 * *** @OPENED@
 * *** @HEADERS_RECEIVED@
 * *** @LOADING@
 * *** @DONE@
 */
