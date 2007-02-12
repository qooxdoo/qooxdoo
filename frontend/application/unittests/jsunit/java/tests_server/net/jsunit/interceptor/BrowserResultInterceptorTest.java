package net.jsunit.interceptor;

import com.opensymphony.webwork.ServletActionContext;
import com.opensymphony.xwork.Action;
import junit.framework.TestCase;
import net.jsunit.DummyHttpRequest;
import net.jsunit.action.BrowserResultAware;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.BrowserResultWriter;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

public class BrowserResultInterceptorTest extends TestCase {

    public void setUp() throws Exception {
        super.setUp();
        Map<String, String[]> requestMap = new HashMap<String, String[]>();
        requestMap.put(BrowserResultWriter.ID, new String[]{"ID_foo"});
        requestMap.put(BrowserResultWriter.USER_AGENT, new String[]{"user agent"});
        requestMap.put(BrowserResultWriter.TIME, new String[]{"4.3"});
        requestMap.put(BrowserResultWriter.JSUNIT_VERSION, new String[]{"2.5"});
        requestMap.put(BrowserResultWriter.TEST_CASES, new String[]{"file:///dummy/path/dummyPage.html:testFoo|1.3|S||"});
        HttpServletRequest request = new DummyHttpRequest(requestMap);
        ServletActionContext.setRequest(request);
    }

    public void tearDown() throws Exception {
        ServletActionContext.setRequest(null);
        super.tearDown();
    }

    public void testSimple() throws Exception {
        BrowserResultInterceptor interceptor = new BrowserResultInterceptor();
        MockAction action = new MockAction();
        MockActionInvocation invocation = new MockActionInvocation(action);
        interceptor.intercept(invocation);
        assertEquals("ID_foo", action.result.getId());
    }

    static class MockAction implements Action, BrowserResultAware {

        private BrowserResult result;

        public String execute() throws Exception {
            return null;
        }

        public void setBrowserResult(BrowserResult result) {
            this.result = result;
        }

    }

}
