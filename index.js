const { chromium } = require("playwright");
const fs = require("fs");
const { stringify } = require("csv-stringify");


async function saveHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com");
  const links = await page.locator('.titleline a').all();

  const writableStream = fs.createWriteStream('./public/top10.csv');
  const stringifier = stringify();
  stringifier.pipe(writableStream);
  
  let count = 0;
  for (const link of links) {
    const href = await link.getAttribute('href');
    const title = await link.innerText();

    if(href.startsWith('http')) {
      count++;
      const record = [count, title, href];
      await stringifier.write(record);
    }

    if(count === 10) {
      stringifier.end();
      break;
    }
  }
  
  await browser.close();
}


async function sortArticles(articles) {
  return articles.sort((a, b) => {
    const pointsA = parseInt(a[0].split(' ')[0], 10);
    const pointsB = parseInt(b[0].split(' ')[0], 10);

    return pointsB - pointsA;
  });
}

async function saveTop10Articles(type) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com");
  
  const elementTag = type === 'score'? '.score' : 'a:has-text(" comments")';
  const elements = await page.locator(elementTag).all();
  const links = await page.locator('.titleline a').all();

  const everything = [];
  let elementIndex = 0;
  for (let i = 0; i < links.length; i++) {
      const link = links[i];

      const href = await link.getAttribute('href');
      const title = await link.innerText();
      
      if(href.startsWith('http')) {
          const element = elements[elementIndex];
          if(element === undefined) { break; }
          const score = await element.innerText();
          const record = [score, title, href];
          everything.push(record);
          elementIndex++;
      }

  }

  await browser.close();

  const sortedArticles = await sortArticles(everything);

  const fileName = type === 'score' ? './public/top10score.csv' : './public/top10comments.csv';
  const writableStream = fs.createWriteStream(fileName);
  const stringifier = stringify();
  stringifier.pipe(writableStream);

  for (let i = 0; i < 10; i++) {
      const record = sortedArticles[i];
      await stringifier.write(record);
  }

  stringifier.end();
}

module.exports = { saveHackerNewsArticles, saveTop10Articles };