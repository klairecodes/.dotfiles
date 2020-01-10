document.addEventListener('DOMContentLoaded', () => {

	if (parent === window) return;

	var mp4CheckForLink = setInterval(() => {

		var video = document.querySelector('video');

		if (video && video.src) {

			clearInterval(mp4CheckForLink);

			parent.postMessage(['MP4UploadURL', video.src], 'https://kissanime.ru');

		}

	}, 100);

	setTimeout(() => {
		clearInterval(mp4CheckForLink);
	}, 8000);

});