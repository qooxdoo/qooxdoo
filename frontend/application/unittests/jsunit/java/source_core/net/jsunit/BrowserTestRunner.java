package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

import java.util.List;

public interface BrowserTestRunner extends XmlRenderable {

    void startTestRun();

    void finishTestRun();

    long launchBrowserTestRun(BrowserLaunchSpecification launchSpec);

    void accept(BrowserResult result);

    boolean hasReceivedResultSince(long launchTime);

    BrowserResult lastResult();

    void dispose();

    BrowserResult findResultWithId(String id, int browserId) throws InvalidBrowserIdException;

    void logStatus(String message);

    List<Browser> getBrowsers();

    int timeoutSeconds();

    boolean isAlive();

}
