package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public interface TestRunListener {

    boolean isReady();

    void testRunStarted();

    void testRunFinished();

    void browserTestRunStarted(Browser browser);

    void browserTestRunFinished(Browser browser, BrowserResult result);

}