chrome.storage.sync.get((items) => {
	$('head').append('<link type="text/css" rel="stylesheet" href="https://ke.pilar.moe/api/v2/disqusTags">');
});

var discordRegex = /(Discord(:)?|https:\/\/discord\.gg\/.+)/gi;

$(window).on('load', function() {

	setTimeout(function() {

		$('#comment-policy *:not(:has("*"))').each(function(index, target) {
			target.innerText = target.innerText.replace(discordRegex, '');
		});

		$('.post.highlighted .post-message div *:not(:has("*"))').each(function(index, target) {
			target.innerText = target.innerText.replace(discordRegex, '');
		});

	}, 1000);

});