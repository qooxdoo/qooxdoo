package net.jsunit.model;

import org.jdom.Element;
import org.jdom.output.XMLOutputter;

public class TestCaseResultWriter {
    public static final String
            TEST_CASE = "testCase",
            NAME = "name",
            TIME = "time",
            FAILURE = "failure",
            ERROR = "error",
            MESSAGE = "message";

    private TestCaseResult result;

    public TestCaseResultWriter(TestCaseResult result) {
        this.result = result;
    }

    public void addXmlTo(Element element) {
        element.addContent(createTestCaseElement());
    }

    public Element createTestCaseElement() {
        Element testCaseElement = new Element(TEST_CASE);
        try {
            testCaseElement.setAttribute(NAME, result.getFullyQualifiedName().replace('\u0000', ' '));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        testCaseElement.setAttribute(TIME, String.valueOf(result.getTime()));
        if (result.hadFailure()) {
            Element failureElement = new Element(FAILURE);
            try {
                failureElement.setText(result.getFailure().replace('\u0000', ' '));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            testCaseElement.addContent(failureElement);
        } else if (result.hadError()) {
            Element errorElement = new Element(ERROR);
            try {
                errorElement.setText(result.getError().replace('\u0000', ' '));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            testCaseElement.addContent(errorElement);
        }
        return testCaseElement;
    }

    public String getProblemSummary() {
        if (result.hadFailure())
            return result.getFullyQualifiedName() + " failed:\n" + result.getFailure();
        else if (result.hadError())
            return result.getFullyQualifiedName() + " had an error:\n" + result.getError();
        return null;
    }

    public String getXmlFragment() {
        return new XMLOutputter().outputString(createTestCaseElement());
    }
}
