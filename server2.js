var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.chevron.com/";
var SEARCH_WORD = "IoT";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;

  //request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
        var i = 0;
       collectInternalLinks($);
       if(i < 7)
       {
           callback();
           i++;
       }
     }
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}