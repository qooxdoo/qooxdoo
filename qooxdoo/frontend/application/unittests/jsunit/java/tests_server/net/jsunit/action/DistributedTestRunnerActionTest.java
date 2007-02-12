package net.jsunit.action;

import junit.framework.TestCase;
import net.jsunit.DummyConfigurationSource;
import net.jsunit.JsUnitFarmServer;
import net.jsunit.RemoteServerHitter;
import net.jsunit.configuration.Configuration;
import net.jsunit.model.TestRunResult;
import org.jdom.Document;

import java.net.URL;

public class DistributedTestRunnerActionTest extends TestCase {

    private DistributedTestRunnerAction action;

    public void setUp() throws Exception {
        super.setUp();
        action = new DistributedTestRunnerAction();
        action.setFarmServer(new JsUnitFarmServer(new Configuration(new DummyConfigurationSource())));
        action.setRemoteRunnerHitter(new SuccessfulRemoteServerHitter());
    }

    public void testSimple() throws Exception {
        assertEquals(DistributedTestRunnerAction.SUCCESS, action.execute());
        assertTrue(action.getTestRunManager().getDistributedTestRunResult().wasSuccessful());
        assertNull(action.getTestRunManager().getOverrideURL());
    }

    public void testOverrideURL() throws Exception {
        String overrideURL = "http://overrideurl.com:1234?foo=bar&bar=fo";
        action.setUrl(overrideURL);
        assertEquals(DistributedTestRunnerAction.SUCCESS, action.execute());
        assertEquals(overrideURL, action.getTestRunManager().getOverrideURL());
    }

    static class SuccessfulRemoteServerHitter implements RemoteServerHitter {

        public Document hitURL(URL url) {
            return new Document(new TestRunResult().asXml());
        }

    }
}
