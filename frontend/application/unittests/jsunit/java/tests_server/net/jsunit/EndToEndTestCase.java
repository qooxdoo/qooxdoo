package net.jsunit;

import junit.framework.TestCase;

public abstract class EndToEndTestCase extends TestCase {

	protected int port;

	public void setUp() throws Exception {
		super.setUp();
		port = new TestPortManager().newPort();
	}

}
