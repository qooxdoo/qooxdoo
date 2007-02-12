package net.jsunit.action;

import net.jsunit.BrowserLaunchSpecification;
import net.jsunit.BrowserTestRunner;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import org.jdom.Element;

import java.util.Arrays;
import java.util.List;

public class BlockingTestRunner implements BrowserTestRunner {
    public boolean blocked;

    public Element asXml() {
        return null;
    }

    public void startTestRun() {
        blocked = true;
        while (blocked) {
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
            }
        }
    }

    public void finishTestRun() {
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
        return Arrays.asList(new Browser[]{new Browser("browser.exe", 0)});
    }

    public int timeoutSeconds() {
        return 0;
    }

    public boolean isAlive() {
        return false;
    }

}
