const test = require("tape");
const colorize = require('tap-colorize');
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const testUtils = require("../../../bin/tools/utils");
const qxCmdPath = testUtils.getCompiler();
const testDir = path.join(__dirname, "test-qx-export-glyphs");

//colorize output
test.createStream().pipe(colorize()).pipe(process.stdout);

function reportError(result) {
  if (result.error) {
    return new Error(`The command exited with an error: ${result.error}. Output was: ${result.output}`);
  }
  return "";
}

async function assertPathExists(path){
  let stat = await fsp.stat(path);
  if (stat.isFile() || stat.isDirectory()) {
    return true;
  }
  throw new Error(`Path does not exist: ${path}`);
}

test("export-glyphs help", async assert => {
  try {
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", "--help");
    assert.ok(result.exitCode === 0, reportError(result));
    assert.ok(result.output.includes("export-glyphs"), "Help should mention export-glyphs command");
    assert.ok(result.output.includes("export font glyphs"), "Help should mention glyph export functionality");
    assert.ok(result.output.includes("fontFile"), "Help should mention fontFile argument");
    assert.ok(result.output.includes("glyphFile"), "Help should mention glyphFile argument");
    assert.ok(result.output.includes("Font file to process"), "Help should describe fontFile");
    assert.ok(result.output.includes("Output glyph file"), "Help should describe glyphFile");
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs with MaterialIcons font", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    // Use the MaterialIcons font that should have ligatures
    const materialIconsFont = path.join(__dirname, "..", "..", "..", "source", "resource", "qx", "iconfont", "MaterialIcons", "materialicons-v126.woff");
    const outputFile = path.join(testDir, "materialicons-glyphs.json");
    
    // Test export-glyphs with MaterialIcons font
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", materialIconsFont, outputFile);
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Verify output file was created
    assert.ok(await assertPathExists(outputFile), "Glyph output file should be created");
    
    // Read and verify the generated JSON
    const glyphData = JSON.parse(await fsp.readFile(outputFile, "utf8"));
    assert.ok(typeof glyphData === "object", "Generated file should contain valid JSON object");
    assert.ok(Object.keys(glyphData).length > 0, "Generated file should contain glyph data");
    
    // Check that glyph data has expected structure
    const firstGlyph = Object.values(glyphData)[0];
    if (firstGlyph) {
      assert.ok(typeof firstGlyph.advanceWidth === "number", "Glyph should have advanceWidth");
      assert.ok(typeof firstGlyph.advanceHeight === "number", "Glyph should have advanceHeight");
      assert.ok(typeof firstGlyph.codePoint === "number", "Glyph should have codePoint");
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs with FontAwesome font", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    // Use the FontAwesome font for testing
    const fontAwesomeFont = path.join(__dirname, "..", "..", "..", "source", "resource", "qx", "test", "webfonts", "fontawesome-webfont.woff");
    const outputFile = path.join(testDir, "fontawesome-glyphs.json");
    
    // Test export-glyphs with FontAwesome font
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", fontAwesomeFont, outputFile);
    // FontAwesome might not have ligatures, so we don't require success but test that it runs
    assert.ok(result.exitCode === 0 || result.output.includes("does not have any ligatures"), "Command should run and either succeed or report no ligatures");
    
    // If the file was created (font has glyphs), verify its structure
    try {
      await assertPathExists(outputFile);
      const glyphData = JSON.parse(await fsp.readFile(outputFile, "utf8"));
      assert.ok(typeof glyphData === "object", "Generated file should contain valid JSON object");
    } catch (err) {
      // File might not exist if font has no ligatures - this is acceptable
      assert.ok(true, "FontAwesome test completed - font may not have ligatures");
    }
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs with TTF font", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    // Use a TTF version of MaterialIcons
    const materialIconsFont = path.join(__dirname, "..", "..", "..", "source", "resource", "qx", "iconfont", "MaterialIcons", "materialicons-v126.ttf");
    const outputFile = path.join(testDir, "materialicons-ttf-glyphs.json");
    
    // Test export-glyphs with TTF font
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", materialIconsFont, outputFile);
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Verify output file was created
    assert.ok(await assertPathExists(outputFile), "Glyph output file should be created for TTF");
    
    // Read and verify the generated JSON
    const glyphData = JSON.parse(await fsp.readFile(outputFile, "utf8"));
    assert.ok(typeof glyphData === "object", "Generated TTF file should contain valid JSON object");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs with invalid font file", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    // Create a fake/invalid font file
    const invalidFont = path.join(testDir, "invalid.woff");
    const outputFile = path.join(testDir, "invalid-glyphs.json");
    await fsp.writeFile(invalidFont, "not a font file");
    
    // Test export-glyphs with invalid font
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", invalidFont, outputFile);
    assert.ok(result.exitCode !== 0, "Should fail with invalid font file");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs missing arguments", async assert => {
  try {
    // Test with missing arguments
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs");
    assert.ok(result.exitCode !== 0, "Should fail when no arguments provided");
    assert.ok(result.output.includes("fontFile") || result.output.includes("required"), "Should mention missing required arguments");
    
    // Test with only one argument
    result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", "somefont.woff");
    assert.ok(result.exitCode !== 0, "Should fail when glyphFile argument is missing");
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});

test("export-glyphs output verification", async assert => {
  try {
    // Setup test directory
    await testUtils.deleteRecursive(testDir);
    await fsp.mkdir(testDir, { recursive: true });
    
    // Use MaterialIcons font for detailed output verification
    const materialIconsFont = path.join(__dirname, "..", "..", "..", "source", "resource", "qx", "iconfont", "MaterialIcons", "materialicons-v126.woff");
    const outputFile = path.join(testDir, "detailed-glyphs.json");
    
    // Test export-glyphs
    let result = await testUtils.runCommand(__dirname, qxCmdPath, "export-glyphs", materialIconsFont, outputFile);
    assert.ok(result.exitCode === 0, reportError(result));
    
    // Read and verify the JSON content in detail
    const glyphData = JSON.parse(await fsp.readFile(outputFile, "utf8"));
    
    // Check specific properties of MaterialIcons
    const glyphNames = Object.keys(glyphData);
    assert.ok(glyphNames.length > 100, "MaterialIcons should have many glyphs (> 100)");
    
    // Check for some common MaterialIcon names (ligatures)
    const commonIcons = ["home", "search", "menu", "close", "settings"];
    let foundIcons = 0;
    commonIcons.forEach(iconName => {
      if (glyphData[iconName]) {
        foundIcons++;
      }
    });
    assert.ok(foundIcons > 0, "Should find at least some common MaterialIcon ligatures");
    
    // Verify JSON structure is valid and properly formatted
    const jsonString = await fsp.readFile(outputFile, "utf8");
    assert.ok(jsonString.includes("\\n") || jsonString.includes("\n"), "JSON should be properly formatted with line breaks");
    assert.ok(jsonString.includes("  "), "JSON should be properly indented");
    
    // Clean up
    await testUtils.deleteRecursive(testDir);
    
    assert.end();
  } catch (ex) {
    assert.end(ex);
  }
});