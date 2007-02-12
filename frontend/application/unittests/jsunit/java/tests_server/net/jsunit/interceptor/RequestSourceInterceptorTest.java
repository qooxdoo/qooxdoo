package net.jsunit.interceptor;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import net.jsunit.DummyHttpRequest;
import net.jsunit.action.RequestSourceAware;

import java.util.HashMap;

public class RequestSourceInterceptorTest extends TestCase {

    public void testSimple() throws Exception {
        DummyHttpRequest request = new DummyHttpRequest(new HashMap());
        request.setIpAddress("123.456.78.9");
        request.setHost("www.example.com");
        ServletActionContext.setRequest(request);
        RequestSourceInterceptor interceptor = new RequestSourceInterceptor();
        RequestSourceAction action = new RequestSourceAction();
        MockActionInvocation invocation = new MockActionInvocation(action);
        interceptor.intercept(invocation);
        assertTrue(invocation.wasInvokeCalled);

        assertEquals("123.456.78.9", action.ipAddress);
        assertEquals("www.example.com", action.host);
    }

    static class RequestSourceAction implements RequestSourceAware, Action {
        private String ipAddress;
        private String host;

        public void setRequestIPAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }

        public void setRequestHost(String host) {
            this.host = host;
        }

        public String execute() throws Exception {
            return null;
        }
    }
}
