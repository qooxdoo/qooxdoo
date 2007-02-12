package net.jsunit.interceptor;

import junit.framework.TestCase;
import com.opensymphony.xwork.Action;
import net.jsunit.action.VersionGrabberAware;
import net.jsunit.version.VersionGrabber;
import net.jsunit.version.JsUnitWebsiteVersionGrabber;

public class VersionGrabberInterceptorTest extends TestCase {

    public void testSimple() throws Exception {
        VersionGrabberInterceptor interceptor = new VersionGrabberInterceptor();
        VersionGrabberAction action = new VersionGrabberAction();
        MockActionInvocation invocation = new MockActionInvocation(action);
        interceptor.intercept(invocation);
        assertNotNull(action.versionGrabber);
        assertTrue(action.versionGrabber instanceof JsUnitWebsiteVersionGrabber);
        assertTrue(invocation.wasInvokeCalled);
    }

    static class VersionGrabberAction implements Action, VersionGrabberAware {
        private VersionGrabber versionGrabber;

        public String execute() throws Exception {
            return null;
        }

        public void setVersionGrabber(VersionGrabber versionGrabber) {
            this.versionGrabber = versionGrabber;
        }
    }
}
