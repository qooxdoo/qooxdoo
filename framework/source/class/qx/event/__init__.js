/**
 * qooxdoo event layer. In a standard qooxdoo application these are the events
 * you have to deal with.
 *
 * The classes in this namespace provide a cross browser event layer. It
 * normalizes not only the registration API but also event behavior.  The event
 * layer is able to support features in all supported browsers, which are
 * normally only available in some of them.
 *
 * The following features are supported in a browser-independent way:
 * <ul>
 *   <li>Canceling of events <code>stopPropagation</code></li>
 *   <li>Prevention of the browser's default behavior <code>preventDefault</code>
 *   <li>Unified event objects matching the DOM 2 event interface (<a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface">Reference</a>)</li>
 *   <li>Support for the event <i>bubbling</i> and <i>capturing</i> phase</li>
 *   <li>Support for mouse event capturing (<a href="http://msdn2.microsoft.com/en-us/library/ms537630.aspx">Reference</a>)</li>
 *   <li>Support for normalized focus and activation handling</li>
 * </ul>
 *
 * The central class is {@link qx.event.Registration} which provides the event
 * registration and de-registration functionality.
 */
