document.addEventListener('DOMContentLoaded', function() {

	if (parent !== window) {

		function rapidVideoShit() {

			var checkForLink = setInterval(function() {

				var videoElement = document.querySelector('video source');

				if (videoElement && videoElement.src) {

					console.debug('RapidVideo Frame: URL found! Sending to parent window.');
					clearInterval(checkForLink);

					let quality = document.querySelector(`a[href^='${window.location.origin}'] div[style*='background-color:#444']`).innerText;

					source = { label: quality, src: videoElement.src };

					console.log(videoElement);

					parent.postMessage(['RapidVideoURL', source], 'https://kissanime.ru');

				} else {

					console.debug('RapidVideo Frame: URL not yet loaded!');

				}

			}, 100);

		}

		var script = document.createElement('script');
		script.appendChild(document.createTextNode('(' + rapidVideoShit + ')();'));
		(document.head || document.body).appendChild(script);

	}

});