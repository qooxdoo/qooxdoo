package net.jsunit.interceptor;

import junit.framework.TestCase;
import net.jsunit.BrowserTestRunner;
import net.jsunit.MockBrowserTestRunner;
import net.jsunit.XmlRenderable;
import net.jsunit.action.JsUnitBrowserTestRunnerAction;

public class BrowserTestRunnerInterceptorTest extends TestCase {

    public void testSimple() throws Exception {
        MockJsUnitAction action = new MockJsUnitAction();
        final BrowserTestRunner mockRunner = new MockBrowserTestRunner();
        BrowserTestRunnerInterceptor.setBrowserTestRunnerSource(new BrowserTestRunnerSource() {
            public BrowserTestRunner getRunner() {
                return mockRunner;
            }

        });
        assertNull(action.getBrowserTestRunner());
        BrowserTestRunnerInterceptor interceptor = new BrowserTestRunnerInterceptor();

        MockActionInvocation mockInvocation = new MockActionInvocation(action);
        interceptor.intercept(mockInvocation);

        assertSame(mockRunner, action.getBrowserTestRunner());
        assertTrue(mockInvocation.wasInvokeCalled);
    }

    public void tearDown() throws Exception {
        BrowserTestRunnerInterceptor.setBrowserTestRunnerSource(new DefaultBrowserTestRunnerSource());
        super.tearDown();
    }

    static class MockJsUnitAction extends JsUnitBrowserTestRunnerAction {

        public String execute() throws Exception {
            return null;
        }

        public XmlRenderable getXmlRenderable() {
            return null;
        }

    }

}
