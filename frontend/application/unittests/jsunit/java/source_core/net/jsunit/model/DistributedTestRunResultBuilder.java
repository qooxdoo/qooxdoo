package net.jsunit.model;

import org.jdom.Document;
import org.jdom.Element;

import java.util.ArrayList;
import java.util.List;

public class DistributedTestRunResultBuilder {

    private BrowserSource browserSource;

    public DistributedTestRunResultBuilder(BrowserSource browserSource) {
        this.browserSource = browserSource;
    }

    public DistributedTestRunResult build(Document document) {
        DistributedTestRunResult result = new DistributedTestRunResult();
        Element root = document.getRootElement();
        TestRunResultBuilder individualTestRunResultBuilder = new TestRunResultBuilder(browserSource);
        for (Element testRunResultElement : new ArrayList<Element>((List<Element>) root.getChildren(TestRunResultBuilder.NAME)))
        {
            testRunResultElement.detach();
            TestRunResult testRunResult = individualTestRunResultBuilder.build(new Document(testRunResultElement));
            result.addTestRunResult(testRunResult);
        }
        return result;
    }
}
