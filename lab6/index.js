const fs = require("fs");
const readline = require("readline");

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (fs.existsSync("index.emark")) {
    const document = fs.readFileSync("index.emark", "utf-8");
    try {
      const processor = new EMarkProcessor();
      processor.processDocument(document);
    } catch (error) {
      console.error(`Ошибка: ${error.message}`);
    }
  } 
  rl.close();
}

class EMarkProcessor {
  constructor() {
    this.tagRegex = /<(?<tag>\w+)(?<attributes>[^>]*)>(?<content>.*?)<\/\k<tag>>/gs;
    this.consoleWidth = 100; 
  }

  processDocument(document) {
    this.parseTag(document, "block");
  }

  parseTag(document, expectedTag) {
    const matches = document.matchAll(this.tagRegex);
    for (const match of matches) {
      const tag = match.groups.tag;
      const attributes = match.groups.attributes;
      const content = match.groups.content.trim();

      if (tag !== expectedTag) {
        throw new Error(`Ожидался тэг <${expectedTag}>, но найден <${tag}>.`);
      }

      if (tag === "block") {
        this.validateBlock(attributes, content);
      } else if (tag === "row") {
        this.processRow(attributes, content);
      }
    }
  }

  validateBlock(attributes, content) {
    const rows = this.extractAttributeValue(attributes, "rows");
    const columns = this.extractAttributeValue(attributes, "columns");

    if (rows <= 0 || columns <= 0) {
      throw new Error("Атрибуты rows и columns должны быть положительными.");
    }

    this.parseTag(content, "row");
  }

  processRow(_attributes, content) {
    const matches = [...content.matchAll(this.tagRegex)];

    for (const match of matches) {
      const tag = match.groups.tag;
      const columnAttributes = match.groups.attributes;
      const columnContent = match.groups.content.trim();

      if (tag === "column") {
        this.renderColumn(columnAttributes, columnContent);
      }
    }

    console.log(); 
  }

  renderColumn(attributes, content) {
    const width = this.extractAttributeValue(attributes, "width");
    const textColor = this.extractAttributeValue(attributes, "textcolor", 15); // Белый по умолчанию
    const bgColor = this.extractAttributeValue(attributes, "bgcolor", 0); // Черный по умолчанию
    const halign = this.extractAttributeValue(attributes, "halign", "left");

    const formattedContent = this.applyAlignment(content, width, halign);
    this.applyConsoleStyles(textColor, bgColor);
    process.stdout.write(formattedContent);
    this.resetConsoleStyles();
  }

  applyAlignment(content, width, alignment) {
    if (content.length > width) {
      content = content.substring(0, width);
    }

    switch (alignment) {
      case "center":
        return content.padStart((width + content.length) / 2).padEnd(width);
      case "right":
        return content.padStart(width);
      default:
        return content.padEnd(width); 
    }
  }

  applyConsoleStyles(textColor, bgColor) {
    const textANSI = `\x1b[3${textColor % 8}m`;
    const bgANSI = `\x1b[4${bgColor % 8}m`;
    process.stdout.write(textANSI + bgANSI);
  }

  resetConsoleStyles() {
    process.stdout.write("\x1b[0m");
  }

  extractAttributeValue(attributes, attributeName, defaultValue = null) {
    const regex = new RegExp(`${attributeName}="(\\d+|\\w+)"`);
    const match = attributes.match(regex);
    if (match) {
      const value = match[1];
      return isNaN(value) ? value : parseInt(value, 10);
    }

    if (defaultValue !== null) {
      return defaultValue;
    }

    throw new Error(`Атрибут ${attributeName} не найден.`);
  }
}

main();