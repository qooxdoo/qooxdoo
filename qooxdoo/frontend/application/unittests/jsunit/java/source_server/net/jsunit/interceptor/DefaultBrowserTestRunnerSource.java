package net.jsunit.interceptor;

import net.jsunit.BrowserTestRunner;
import net.jsunit.ServerRegistry;

public class DefaultBrowserTestRunnerSource implements BrowserTestRunnerSource {

    public BrowserTestRunner getRunner() {
        return ServerRegistry.getStandardServer();
    }

}
