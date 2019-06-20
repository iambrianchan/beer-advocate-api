var request = require('request'),
    cheerio = require('cheerio');

exports.beerSearch = function(query, callback) {

    var url = "http://beeradvocate.com/search/?q=" + encodeURIComponent(query) + "&qt=beer";

    request(url, function (error, response, html) {
    	if (error) {
    	    console.log(error)
    	}

        if (!error && response.statusCode == 200) {

	    var $ = cheerio.load(html);
            var beers_names = [];
            var beers_locations = [];

            $('#ba-content div').eq(1).children('div').children('a').each(function(beer) {
                // One beer listing
                var item = $(this);

                // Beer details
                beer_name = item.text(),
                beer_url = item.attr('href');

                // Data to return
                var data = {
                    beer_name: beer_name,
                    beer_url: beer_url,
                };
                
                // Add to beer array
                beers_names.push(data);

            });

            // Filter out the elements the span elements that say "Retired"
            var filtered = $('#ba-content div').eq(1).children('div').children('span').map(function(beer) {
                    if ($(this).children().length > 0) {
                        return $(this);
                    }
                });
            // Iterate over each of the span elements to extract brewery/location info
            filtered.each(function(beer) {
                var item = $(this);

               // Brewery details
                   brewery_name = item.find('a').text(),
                   brewery_url = item.find('a').attr('href'),
                   brewery_location = item.text().split('|')[1].replace(/[0-9\.]/g, '').trim();

                // Data to return
                var data = {
                   brewery_name: brewery_name,
                   brewery_location: brewery_location,
                   brewery_url: brewery_url,
                };
                // Add to beer array
                beers_locations.push(data);

            });

            beers = beers_names.map(function(beer_name, index) {
                return {...beer_name, ...beers_locations[index]};

            });

            callback(beers);

        }

    });

}

exports.beerPage = function(url, callback) {

    var url = "http://beeradvocate.com" + url;

    request(url, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html);

            var beer = [];

            // Beer & brewery name
            var title = $('h1').text().split(/\s\|\s/),
                beer_name = title[0],
                brewery_name = title[1];

            // ABV
            var beer_abv_chunk = $('#info_box').eq(0),
                beer_abv = beer_abv_chunk.text().match(/[0-9.0-9]+%/)[0];

            // Brewery details
            var links = beer_abv_chunk.find('a'),
                brewery_state = links.eq(1).text(),
                brewery_country = links.eq(2).text(),
                beer_style = links.eq(4).text();

            // Beer Advocate scores
            var ba_info = $('#score_box').eq(0),
                ba_score = ba_info.find('span.ba-ravg').text() + ba_info.find('span.BAscore_big_5').text(),
                ba_rating = ba_info.find('b').eq(1).text();

            var bros_info = $('.BAscore_big').eq(1),
                bros_score = bros_info.text(),
                bros_rating = bros_info.next().next().text();

            // More stats
            var stats = $('#item_stats dl').eq(0).text().match(/Ranking.+%/gs)[0].split('\n');
            filtered = stats.filter(function(item) {
                return item != '';
            });

                rankings = stats[1].replace("#", ""),
                reviews = stats[3],
                ratings = stats[5],
                pDev = stats[7];


            // Data to return
            var data = {
                beer_name: beer_name,
                beer_style: beer_style,
                beer_abv: beer_abv,
                brewery_name: brewery_name,
                brewery_state: brewery_state,
                brewery_country: brewery_country,
                ba_score: ba_score,
                ba_rating: ba_rating,
                bros_score: bros_score,
                bros_rating: bros_rating,
                rankings: rankings,
                reviews: reviews,
                ratings: ratings,
                pDev: pDev
            };

            // Add to beer array
            beer.push(data);

            callback(beer);

        }

    });

}
