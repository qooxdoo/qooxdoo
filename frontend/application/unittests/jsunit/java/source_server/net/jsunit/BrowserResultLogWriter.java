package net.jsunit;

import net.jsunit.logging.BrowserResultRepository;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public class BrowserResultLogWriter implements TestRunListener {

    private BrowserResultRepository repository;

    public BrowserResultLogWriter(BrowserResultRepository repository) {
        this.repository = repository;
    }

    public void browserTestRunFinished(Browser browser, BrowserResult result) {
        repository.store(result);
    }

    public void browserTestRunStarted(Browser browser) {
    }

    public boolean isReady() {
        return true;
    }

    public void testRunStarted() {
    }

    public void testRunFinished() {
    }

}