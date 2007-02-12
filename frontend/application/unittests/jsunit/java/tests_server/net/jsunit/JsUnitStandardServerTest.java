package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationException;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public class JsUnitStandardServerTest extends TestCase {

    private JsUnitStandardServer server;

    public void setUp() throws Exception {
        super.setUp();
        server = new JsUnitStandardServer(new Configuration(new DummyConfigurationSource()), new MockBrowserResultRepository(), false);
    }

    public void testStartTestRun() throws Exception {
        server.setProcessStarter(new MockProcessStarter());
        MockTestRunListener listener = new MockTestRunListener();
        server.addBrowserTestRunListener(listener);
        Thread thread = new Thread() {
            public void run() {
                try {
                    server.startTestRun();
                } catch (Exception e) {
                    fail(e.toString());
                }
            }
        };
        thread.start();
        Thread.sleep(500);
        assertTrue(thread.isAlive());
        listener.isReady = true;
        thread.join();
    }

    public void testLaunchingBrowser() {
        MockProcessStarter starter = new MockProcessStarter();
        server.setProcessStarter(starter);
        MockTestRunListener listener = new MockTestRunListener();
        server.addBrowserTestRunListener(listener);

        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser(DummyConfigurationSource.BROWSER_FILE_NAME, 0)));
        assertTrue(listener.browserTestRunStartedCalled);
        assertEquals(2, starter.commandPassed.length);
        assertEquals("mybrowser.exe", starter.commandPassed[0]);
        assertEquals(DummyConfigurationSource.DUMMY_URL, starter.commandPassed[1]);
        assertFalse(listener.testRunFinishedCalled);
        server.accept(new DummyBrowserResult(true, 0, 0));
        assertTrue(listener.browserTestRunFinishedCalled);
    }

    public void testLaunchingBrowserCrashes() throws InterruptedException {
        BlowingUpProcessStarter starter = new BlowingUpProcessStarter();
        server.setProcessStarter(starter);
        MockTestRunListener listener = new MockTestRunListener();
        server.addBrowserTestRunListener(listener);

        long launchTime = server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser(DummyConfigurationSource.BROWSER_FILE_NAME, 0)));
        assertTrue(listener.browserTestRunStartedCalled);
        assertTrue(listener.browserTestRunFinishedCalled);
        assertTrue(listener.result.failedToLaunch());
        assertTrue(server.hasReceivedResultSince(launchTime));
        assertEquals(new Browser("mybrowser.exe", 0), listener.browser);
        assertEquals("mybrowser.exe", listener.result.getBrowser().getFileName());
        assertSame(listener.result, server.lastResult());

        server.setProcessStarter(new MockProcessStarter());
        listener.reset();
        launchTime = server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("mybrowser2.exe", 1)));
        assertFalse(server.hasReceivedResultSince(launchTime));
        assertTrue(listener.browserTestRunStartedCalled);
        assertFalse(listener.browserTestRunFinishedCalled);
        assertEquals(new Browser("mybrowser2.exe", 1), listener.browser);
    }

    public void testStartEnd() {
        server.setProcessStarter(new MockProcessStarter());
        MockTestRunListener listener = new MockTestRunListener();
        listener.isReady = true;
        server.addBrowserTestRunListener(listener);
        server.startTestRun();
        assertTrue(listener.testRunStartedCalled);
        server.finishTestRun();
        assertTrue(listener.testRunFinishedCalled);
    }

    public void testAcceptResult() {
        server.setProcessStarter(new MockProcessStarter());
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0)));
        BrowserResult result = new BrowserResult();
        server.accept(result);
        assertEquals("mybrowser.exe", result.getBrowser().getFileName());
    }

    public void testOverrideUrl() {
        MockProcessStarter starter = new MockProcessStarter();
        server.setProcessStarter(starter);
        MockTestRunListener listener = new MockTestRunListener();
        server.addBrowserTestRunListener(listener);

        String overrideUrl = "http://my.example.com:8080?submitResults=true&autoRun=true";
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0), overrideUrl));
        assertEquals(2, starter.commandPassed.length);
        assertEquals("mybrowser.exe", starter.commandPassed[0]);
        assertEquals(overrideUrl, starter.commandPassed[1]);
    }

    public void testAddingSubmitResultsAndAutoRunParameters() throws Exception {
        MockProcessStarter starter = new MockProcessStarter();
        server.setProcessStarter(starter);
        MockTestRunListener listener = new MockTestRunListener();
        server.addBrowserTestRunListener(listener);

        String overrideUrlWithoutSubmitResults = "http://my.example.com:8080?param=value";
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0), overrideUrlWithoutSubmitResults));
        assertEquals(2, starter.commandPassed.length);
        assertEquals("mybrowser.exe", starter.commandPassed[0]);
        assertEquals(
                overrideUrlWithoutSubmitResults + "&autoRun=true&submitResults=localhost:1234/jsunit/acceptor",
                starter.commandPassed[1]
        );
    }

    public void testNoURLSpecified() throws Exception {
        server = new JsUnitStandardServer(new Configuration(new DummyConfigurationSource() {
            public String url() {
                return "";
            }
        }), new MockBrowserResultRepository(), false);
        MockProcessStarter starter = new MockProcessStarter();
        server.setProcessStarter(starter);
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0)));
        assertFalse(server.lastResult().wasSuccessful());
        assertTrue(server.lastResult().getServerSideExceptionStackTrace().indexOf(NoUrlSpecifiedException.class.getName()) != -1);
    }

    public void testInvalidConfiguration() {
        try {
            server = new JsUnitStandardServer(new Configuration(new InvalidConfigurationSource()), false);
            fail();
        } catch (ConfigurationException e) {

        }
    }

    public void testAwaitingBrowserSubmission() throws Exception {
        server.setProcessStarter(new MockProcessStarter());
        assertFalse(server.isAwaitingBrowserSubmission());
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser("foo.exe", 1)));
        assertTrue(server.isAwaitingBrowserSubmission());
    }

    static class InvalidConfigurationSource extends DummyConfigurationSource {

        public String url() {
            return "invalid url";
        }

    }

}