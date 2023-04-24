const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

const context = [];
const tryItLinks = [];

const htmlBaseUrl = 'https://www.w3schools.com/html/';
const tagsBaseUrl = 'http://www.w3schools.com/tags/';
const url = `${htmlBaseUrl}default.asp`;
const tagsurl = `${tagsBaseUrl}default.asp`;
const axiosTags = require('./tags.js');

const axiosResponse = async (url) => {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Extract headings and paragraphs
    const h2cont = $('.color_h1');
    console.log(h2cont.text().trim());
    const htmlHigh = $('h2,p');
    htmlHigh.each(function () {
      const tagname = $(this).text().trim().replaceAll('\n',"");
      if(tagname.length >0){
        context.push({ context: tagname });
      }
      // context.push({ context:"this is the addtional content"})
    });
    // Extract try it links
    const tryItDivs = $('.w3-margin-bottom');
    tryItDivs.each(function () {
      const href = $(this).attr('href');
      if (href && href.startsWith('/html/tryit.asp')) {
        const tryItLink = htmlBaseUrl + href;
        tryItLinks.push(tryItLink);
        axiosResponseTryIt(tryItLink);
      }
    });
    
    // Follow next page link
    const nextPageBtn = $('.nextprev .w3-right');
    const nextPageLink = nextPageBtn.attr('href');
    if (nextPageLink && !nextPageLink.startsWith('https://')) {
      const nextPageUrl = htmlBaseUrl + nextPageLink;
      if(nextPageLink == undefined ){
        console.log(undefined)
      }else if(nextPageLink.startsWith('/tags/')){
        // axiosTags(tagsurl)
        // console.log(tagsurl)
        axiosTagsLink(tagsurl);
      } 
      else{
        
        console.log(nextPageUrl);
        axiosResponse(nextPageUrl);
      }
    }
    
  } catch (error) {
    console.error(error);
  }
};

const axiosResponseTryIt = async (tryItLink) => {
  try {
    const res = await axios.get(tryItLink);
    const $ = cheerio.load(res.data);
    const tryItCodes = $('#textarea').text().trim();
    context.push({ context: tryItCodes });
    console.log(tryItCodes)
  } catch (error) {
    console.error(error);
  }
};

const axiosTagsLink = async(tagsurl) =>{
  try{
      const res = await axios.get(tagsurl);
      const $ = cheerio.load(res.data);
      const h2cont = $('.color_h1');
      console.log(h2cont.text().trim());
      const htmlHigh = $('h2,p');
      htmlHigh.each(function () {
        const tagname = $(this).text().trim().replaceAll('\n',' ');
        context.push({ context: tagname });
      });
      const tables = $('tbody').find('tr');
      tables.each(function () {
              const table_row = $(this).text().trim().replaceAll('\n', '');
              console.log(table_row);
              context.push({ context: table_row });
          })

      const tryItDivs = $('.w3-margin-bottom');
      tryItDivs.each(function () {
        const href = $(this).attr('href');
        if (href && href.startsWith('/html/tryit.asp')) {
          const tryItLink = htmlBaseUrl + href;
          tryItLinks.push(tryItLink);
          axiosResponseTryIt(tryItLink);
        }
      });
      const nextPageBtn = $('.nextprev .w3-right');
      const nextPageLink = nextPageBtn.attr('href');
      if (nextPageLink && !nextPageLink.startsWith('https://')) {
        const nextPageUrl = tagsBaseUrl + nextPageLink;
        if (nextPageLink == undefined) {
          console.log(undefined)
        }else if(nextPageLink == 'tag_wbr.asp'){
          console.log('stopping at /tags/tag_wbr.asp')
          context.push({context: "this is additional content"})
        }
        else {

          console.log(nextPageUrl);
          axiosTagsLink(nextPageUrl);
        }
      }

  }catch(e){
    console.log(e);
  }
}

app.get('/', (req, res) => {
  res.send(context);
});

app.listen(3000,'0.0.0.0', () => {
  console.log('Listening at http://localhost:3000');
});

axiosResponse(url);
