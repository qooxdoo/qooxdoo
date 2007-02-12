package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public class MockTestRunListener implements TestRunListener {

    public boolean testRunStartedCalled;
    public boolean testRunFinishedCalled;
    public boolean browserTestRunStartedCalled;
    public boolean browserTestRunFinishedCalled;
    public Browser browser;
    public boolean isReady;
    public BrowserResult result;

    public void browserTestRunFinished(Browser browser, BrowserResult result) {
        browserTestRunFinishedCalled = true;
        this.browser = browser;
        this.result = result;
    }

    public void browserTestRunStarted(Browser browser) {
        browserTestRunStartedCalled = true;
        this.browser = browser;
    }

    public boolean isReady() {
        return isReady;
    }

    public void testRunStarted() {
        testRunStartedCalled = true;
    }

    public void testRunFinished() {
        testRunFinishedCalled = true;
    }

    public void reset() {
        testRunStartedCalled = false;
        testRunFinishedCalled = false;
        browserTestRunStartedCalled = false;
        browserTestRunFinishedCalled = false;
        browser = null;
        isReady = false;
        result = null;
    }

}