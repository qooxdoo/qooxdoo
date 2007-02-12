package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.TestRunResult;
import net.jsunit.utility.SystemUtility;
import org.jdom.Element;

import java.util.Arrays;
import java.util.List;

public class TestRunManagerTest extends TestCase {

    public void testDisposedDuringTestRun() throws InterruptedException {
        KillableBrowserTestRunner runner = new KillableBrowserTestRunner();
        final TestRunManager manager = new TestRunManager(runner);
        Thread thread = new Thread() {
            public void run() {
                manager.runTests();
            }
        };
        thread.start();
        while (!runner.startTestRunCalled)
            Thread.sleep(10);
        runner.isAlive = false;
        thread.join();
        assertTrue(runner.finishTestRunCalled);
    }

    public void testOverrideUrl() {
        MockBrowserTestRunner runner = new MockBrowserTestRunner();
        runner.hasReceivedResult = true;
        String overrideUrl = "http://my.override.url:8080/jsunit/testRunner.html?someParam=someValue&someOtherParam=someOtherValue";
        TestRunManager manager = new TestRunManager(runner, overrideUrl);
        manager.runTests();

        assertEquals(2, runner.launchSpecs.size());
        BrowserLaunchSpecification spec1 = runner.launchSpecs.get(0);
        assertTrue(spec1.hasOverrideUrl());
        assertEquals(overrideUrl, spec1.getOverrideUrl());
        BrowserLaunchSpecification spec2 = runner.launchSpecs.get(1);
        assertTrue(spec2.hasOverrideUrl());
        assertEquals(overrideUrl, spec2.getOverrideUrl());
    }

    public void testNoOverrideUrl() {
        MockBrowserTestRunner runner = new MockBrowserTestRunner();
        runner.hasReceivedResult = true;
        TestRunManager manager = new TestRunManager(runner, null);
        manager.runTests();

        assertEquals(2, runner.launchSpecs.size());
        assertFalse(runner.launchSpecs.get(0).hasOverrideUrl());
        assertFalse(runner.launchSpecs.get(1).hasOverrideUrl());
    }

    public void testPropertiesSet() throws Exception {
        MockBrowserTestRunner runner = new MockBrowserTestRunner();
        runner.hasReceivedResult = true;
        TestRunManager manager = new TestRunManager(runner, null);
        manager.runTests();
        TestRunResult testRunResult = manager.getTestRunResult();
        assertEquals(SystemUtility.osString(), testRunResult.getOsString());
        assertEquals(SystemUtility.ipAddress(), testRunResult.getIpAddress());
        assertEquals(SystemUtility.hostname(), testRunResult.getHostname());
    }

    static class SuccessfulBrowserTestRunner implements BrowserTestRunner {

        public List<Browser> getBrowsers() {
            return Arrays.asList(new Browser("browser1.exe", 0), new Browser("browser2.exe", 1));
        }

        public long launchBrowserTestRun(BrowserLaunchSpecification launchSpec) {
            return 0;
        }

        public boolean hasReceivedResultSince(long launchTime) {
            return true;
        }

        public BrowserResult lastResult() {
            return new DummyBrowserResult(true, 0, 0);
        }

        public void accept(BrowserResult result) {
        }

        public void dispose() {
        }

        public BrowserResult findResultWithId(String id, int browserId) {
            return null;
        }

        public Element asXml() {
            return null;
        }

        public void startTestRun() {
        }

        public void finishTestRun() {
        }

        public void logStatus(String message) {
        }

        public int timeoutSeconds() {
            return 0;
        }

        public boolean isAlive() {
            return true;
        }

    }

    static class FailingBrowserTestRunner implements BrowserTestRunner {

        private Browser currentBrowser;

        public List<Browser> getBrowsers() {
            return Arrays.asList(
                    new Browser("browser1.exe", 0),
                    new Browser("browser2.exe", 1),
                    new Browser("browser3.exe", 2)
            );
        }

        public long launchBrowserTestRun(BrowserLaunchSpecification launchSpec) {
            currentBrowser = launchSpec.getBrowser();
            return 0;
        }

        public boolean hasReceivedResultSince(long launchTime) {
            return true;
        }

        public BrowserResult lastResult() {
            if (currentBrowser.hasId(0))
                return new DummyBrowserResult(false, 0, 1);
            else if (currentBrowser.hasId(1))
                return new DummyBrowserResult(false, 1, 0);
            else
                return new DummyBrowserResult(false, 2, 3);
        }

        public void accept(BrowserResult result) {
        }

        public void dispose() {
        }

        public BrowserResult findResultWithId(String id, int browserId) {
            return null;
        }

        public Element asXml() {
            return null;
        }

        public void startTestRun() {
        }

        public void finishTestRun() {
        }

        public void logStatus(String message) {
        }

        public int timeoutSeconds() {
            return 0;
        }

        public boolean isAlive() {
            return true;
        }

    }

    static class KillableBrowserTestRunner implements BrowserTestRunner {

        private boolean isAlive;
        private boolean startTestRunCalled;
        private boolean finishTestRunCalled;

        public void startTestRun() {
            startTestRunCalled = true;
        }

        public void finishTestRun() {
            finishTestRunCalled = true;
        }

        public long launchBrowserTestRun(BrowserLaunchSpecification launchSpec) {
            return 0;
        }

        public void accept(BrowserResult result) {
        }

        public boolean hasReceivedResultSince(long launchTime) {
            return false;
        }

        public BrowserResult lastResult() {
            return null;
        }

        public void dispose() {
        }

        public BrowserResult findResultWithId(String id, int browserId) {
            return null;
        }

        public void logStatus(String message) {
        }

        public List<Browser> getBrowsers() {
            return Arrays.asList(new Browser("browser1.exe", 0));
        }

        public int timeoutSeconds() {
            return 0;
        }

        public boolean isAlive() {
            return isAlive;
        }

        public Element asXml() {
            return null;
        }

    }

}