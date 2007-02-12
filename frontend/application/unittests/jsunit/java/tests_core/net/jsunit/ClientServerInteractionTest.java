package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;
import net.jsunit.model.DummyBrowserSource;

public class ClientServerInteractionTest extends TestCase {

    private RemoteTestRunClient client;
    private TestRunNotifierServer server;
    private MockTestRunListener mockTestRunListener;

    public void setUp() throws Exception {
        super.setUp();
        mockTestRunListener = new MockTestRunListener();
        client = new RemoteTestRunClient(new DummyBrowserSource("mybrowser.exe", 4), mockTestRunListener, 8083);
        client.startListening();
        server = new TestRunNotifierServer(new MockBrowserTestRunner(), 8083);
        server.testRunStarted();
    }

    public void tearDown() throws Exception {
        server.testRunFinished();
        client.stopListening();
        super.tearDown();
    }

    public void testSimple() throws InterruptedException {

        server.browserTestRunStarted(new Browser("mybrowser.exe", 4));
        while (!mockTestRunListener.browserTestRunStartedCalled)
            Thread.sleep(3);
        assertEquals(new Browser("mybrowser.exe", 4), mockTestRunListener.browser);
    }

}
