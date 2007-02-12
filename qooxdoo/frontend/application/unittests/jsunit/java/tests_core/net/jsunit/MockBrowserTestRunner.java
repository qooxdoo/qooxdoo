package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import org.jdom.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MockBrowserTestRunner implements BrowserTestRunner {

    public boolean disposeCalled;
    public BrowserResult acceptedResult;
    public BrowserResult resultToReturn;
    public boolean shouldSucceed;
    public String idPassed;
    public Integer browserIdPassed;
    public int timeoutSeconds;
    public boolean hasReceivedResult;
    public List<String> logMessages = new ArrayList<String>();
    public List<BrowserLaunchSpecification> launchSpecs = new ArrayList<BrowserLaunchSpecification>();

    public void startTestRun() {
    }

    public void finishTestRun() {
    }

    public long launchBrowserTestRun(BrowserLaunchSpecification launchSpec) {
        launchSpecs.add(launchSpec);
        return 0;
    }

    public void accept(BrowserResult result) {
        this.acceptedResult = result;
    }

    public boolean hasReceivedResultSince(long launchTime) {
        return hasReceivedResult;
    }

    public BrowserResult lastResult() {
        return new DummyBrowserResult(shouldSucceed, shouldSucceed ? 0 : 1, 0);
    }

    public void dispose() {
        disposeCalled = true;
    }

    public BrowserResult findResultWithId(String id, int browserId) throws InvalidBrowserIdException {
        idPassed = id;
        browserIdPassed = browserId;
        return resultToReturn;
    }

    public void logStatus(String message) {
        logMessages.add(message);
    }

    public List<Browser> getBrowsers() {
        return Arrays.asList(new Browser[]{new Browser("mybrowser1.exe", 0), new Browser("mybrowser2.exe", 1)});
    }

    public int timeoutSeconds() {
        return timeoutSeconds;
    }

    public Element asXml() {
        return null;
    }

    public boolean isAlive() {
        return true;
    }

}
