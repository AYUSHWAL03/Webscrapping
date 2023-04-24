const express = require('express');
const app = express();
const  cheerio = require('cheerio');
const axios = require('axios');
const tagsBaseUrl = 'http://www.w3schools.com/tags/';
// const tagsurl = `${tagsBaseUrl}default.asp`;
const tryItLinks = [];
const context = [];

const axiosResponse_tags = async(tagsurl) =>{
    try {
        const res = await axios.get(tagsurl);
        const $ = cheerio.load(res.data);

        const h2cont = $('.color_h1');
        console.log(h2cont.text());
        const htmlHigh = $('h2,p');
        htmlHigh.each(function () {
        const tagname = $(this).text();
        context.push({ context: tagname });

        const tables = $('tbody').find('tr');
        tables.each(function () {
            const table_row = $(this).text();
            // console.log(table_row);
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
        const nextPageAvailable = nextPageBtn.length;
        console.log(nextPageAvailable)
        const nextPageLink = nextPageBtn.attr('href');
        if (nextPageLink && !nextPageLink.startsWith('https://')) {
        nextPageUrl = tagsBaseUrl + nextPageLink;
        if(nextPageLink == 'tag_wbr.asp'){
            console.log('undefined')
        }else{
            console.log(nextPageUrl);
            axiosResponse_tags(nextPageUrl);
            
        }
        }

    });

    } catch (error) {
        console.log(error);
    }
}

const axiosResponseTryIt = async (tryItLink) => {
    try {
      const res = await axios.get(tryItLink);
      const $ = cheerio.load(res.data);
      const tryItCodes = $('#textarea').text();
      context.push({ context: tryItCodes });
    } catch (error) {
      console.error(error);
    }
  };

module.exports = axiosResponse_tags;
//if 