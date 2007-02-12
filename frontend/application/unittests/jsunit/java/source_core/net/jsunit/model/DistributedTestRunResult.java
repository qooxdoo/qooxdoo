package net.jsunit.model;

import net.jsunit.XmlRenderable;
import org.jdom.Element;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DistributedTestRunResult extends AbstractResult implements XmlRenderable {

    public static final String NAME = "distributedTestRunResult";

    private List<TestRunResult> testRunResults = new ArrayList<TestRunResult>();

    protected List<? extends Result> getChildren() {
        return testRunResults;
    }

    public void addTestRunResult(TestRunResult result) {
        testRunResults.add(result);
        Collections.sort(testRunResults);
    }

    public Element asXml() {
        Element root = new Element(NAME);
        root.setAttribute("type", getResultType().name());
        for (TestRunResult testRunResult : testRunResults)
            root.addContent(testRunResult.asXml());
        return root;
    }

    public List<TestRunResult> getTestRunResults() {
        return testRunResults;
    }

}
