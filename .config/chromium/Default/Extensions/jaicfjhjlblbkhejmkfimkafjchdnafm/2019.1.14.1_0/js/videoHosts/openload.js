document.addEventListener('DOMContentLoaded', function () {

	if (parent !== window) {

		var checkForLink = setInterval(function() {

			document.querySelector('#videooverlay').click();

			var url = $('p[id]:contains("~")')[0];

			if (url && url.innerText === 'Nothin to see here') {

				console.info('Openload Frame: URL not yet loaded!');

			} else {

				console.info('Openload Frame: URL found! Sending to parent window.');

				console.log(window.location.origin);

				clearInterval(checkForLink);

				parent.postMessage(['OpenloadURL', window.location.origin + '/stream/' + url.innerText], 'https://kissanime.ru');

			}

		}, 10);

	}

});