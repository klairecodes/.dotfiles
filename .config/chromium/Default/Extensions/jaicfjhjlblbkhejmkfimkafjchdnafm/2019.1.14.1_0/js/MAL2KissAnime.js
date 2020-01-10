$(function() {

	$('h2:contains("Statistics")').before('<div id="kissAnimeLinks"><h2>KissAnime Links</h2><div id="searching">Searching...</div></div><br>');

	var animeTitles = ( (  [$('#contentWrapper > div:first-child span').text()].concat( find('English:') ) ).concat( find('Synonyms:') ) ).concat( find('Japanese:') ); // Merges all the titles into one array

	chrome.runtime.sendMessage({

		MAL2KissAnime: { titles: animeTitles }

	}, function(response) {

		if (response.success) {

			$('#searching').remove();

			$(response.data).each(function(index, value) {

				$('#searching').remove();

				$('#kissAnimeLinks').append(value).append('<br>');

			});

		} else {

			$('#searching').remove();

			if (response.code === 0) $('#kissAnimeLinks').append("<div>Could not reach <a href='https://kissanime.ru/'>KissAnime</a>. Cloudflare cookie does not exist. Visit <a href='https://kissanime.ru/'>KissAnime</a> then try again.</div>")

			else $('#kissAnimeLinks').append(`Error: ${response.code}: ${response.data}`);

		}

	});

	function find(a) {

		return $(`.dark_text:contains(${a})`).parent().text().replace(a ,'').trim().split(', ');

	}

});