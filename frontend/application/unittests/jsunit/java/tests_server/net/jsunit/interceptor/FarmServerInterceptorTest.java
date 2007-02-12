package net.jsunit.interceptor;

import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import net.jsunit.DummyConfigurationSource;
import net.jsunit.JsUnitFarmServer;
import net.jsunit.action.JsUnitServerAware;
import net.jsunit.configuration.Configuration;

public class FarmServerInterceptorTest extends TestCase {

    public void testSimple() throws Exception {
        MockAction action = new MockAction();
        JsUnitFarmServer server = new JsUnitFarmServer(new Configuration(new DummyConfigurationSource()));
        assertNull(action.farmServer);
        FarmServerInterceptor interceptor = new FarmServerInterceptor();

        MockActionInvocation mockInvocation = new MockActionInvocation(action);
        interceptor.intercept(mockInvocation);

        assertSame(server, action.farmServer);
        assertTrue(mockInvocation.wasInvokeCalled);
    }

    static class MockAction implements Action, JsUnitServerAware {
        public JsUnitFarmServer farmServer;

        public String execute() throws Exception {
            return null;
        }

        public void setFarmServer(JsUnitFarmServer farmServer) {
            this.farmServer = farmServer;
        }
    }

}
