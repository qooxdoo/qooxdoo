/**
 * *Logging Facilities*
 *
 * The logging system consists of two major components: loggers and appenders.
 * You can think of loggers as the target where application code sends its log
 * messages to. Appenders are then used by a logger to do the actual writing of
 * the message to an acutal device (like a window). In this sense, loggers
 * specify the <em>internal</em> target for a log message, whereas appenders
 * specify the <em>external</em> target the message is written to.
 *
 * Loggers are attached to application classes, appenders are attached to
 * loggers. Every qooxdoo class has a default logger that can be retreived with
 * <code>getLogger()</code>. There is also a default appender, and both types
 * can be removed or added. Both loggers and appenders are organised
 * hierarchically along the application namespaces so that objects further down
 * the name hierarchy use loggers and appenders of the packages further up the
 * hierarchy if they have no own defined. I.e. a <em>my.application.clazz</em>
 * class uses the logger defined for <em>my.application</em> if it has no own,
 * or the one for <em>my</em> if <em>my.application</em> has none. Corresponding
 * <code>getParent*()</code> methods are provided to this end.
 *
 * This package provides the standard Logger class. On the appender side, an
 * abstract Appender base class is provided, and then various specialised
 * appenders (like AlertAppender, WindowAppender, etc.) that use different
 * output devices.
 *
 * Both loggers and appenders can deploy filters, to select from the incoming
 * messages. The package provides an abstract Filter and a DefaultFilter class
 * implementation to this end.
 */
