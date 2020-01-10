// STILL NEEDS BE LOOKED OVER //

// Sets up toastr //
toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": false,
	"progressBar": true,
	"positionClass": "toast-bottom-center",
	"preventDuplicates": true,
	"onclick": null,
	"showDuration": "fast",
	"hideDuration": "fast",
	"timeOut": "5000",
	"extendedTimeOut": "5000",
	"showEasing": "linear",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
};

// Foolproof way of making sure the user doesn't leave a forward slash at the end of the url for whatever reason. Not really. Just don't want to bother with finding a better solution.
if (window.location.pathname.slice(-1) === '/') window.location = window.location.href.slice(0, -1);

if (/^\/Anime\/([^\/$]*)$/.test(window.location.pathname) || /^\/Anime\/([^\/$]*)\/$/.test(window.location.pathname)) {

	document.addEventListener('DOMContentLoaded', function() {

		var AnimeTitleRaw = $('.barContent > div > a.bigChar').text(); // Used for Pinned List related stuff
		var AnimeTitle = AnimeTitleRaw.replace(' (Sub)', '').replace(' (Dub)', '').trim();
		var otherNames = [AnimeTitle];

		$('span:contains("Other name:")').parent().find('a').each(function() {
			otherNames.push($(this).text());
		});

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/AnimeInfo.css')}" rel="stylesheet" type="text/css">`);

		$('span[id*="spanBookmark"]').parent().after(`
			<div class="efka-p">
				<span id="redditThreadContainer" class="KEPad" style="display:none"></span>
				<a href="https://nyaa.si/?f=0&c=1_2&q=${AnimeTitle.replace(/ /g, '+')}" target="_blank">Search for Torrent (Nyaa.si)</a>
			</div>
			<div class="efka-p">
				<div id="malContainer">
					<span id="findinMALContainer" style="display: none" class="KEPad">
						<img id="MALImage" class="KEImg" src=${chrome.runtime.getURL('images/mal-icon.png')}>
						<a href="https://myanimelist.net/anime.php?q=${encodeURIComponent(AnimeTitle)}" target="_blank">Find in MAL</a>
					</span>
				</div>
			</div>
			<div class="efka-p">
				<div id="kitsuContainer" style="display: none">
					<span id="findInKitsu" class="KEPad">
						<img id="kitsuImg" class="KEImg" src="${chrome.runtime.getURL('images/kitsu.webp')}" style="margin-right:2px">
						<a id="kitsuLink" target="_blank"></a>
					</span>
					<span id="totalScoreKitsuContainer" class="KEPad">
						<span class="info">Kitsu Score: </span>
						<span id="kitsuScore"></span>
					</span>
				</div>
			</div>
		`);

		// Shows the MAL Search/Reddit Discussions Containers if the option is enabled //
		chrome.storage.sync.get(['enableFindinMAL', 'enableFindinKitsu', 'enableFindRedditDiscussions'], function(items) {

			if (items.enableFindinMAL === true) $('#findinMALContainer').css('display', 'inline-block');

			if (items.enableFindinKitsu || items.enableFindinKitsu === undefined) kitsuSearch();

			if (items.enableFindRedditDiscussions == true) {
				$('#redditThreadContainer').css('display', 'inline-block');
				redditDiscussionLinks();
			}

		});

		/////////////////////////////////////////////////
		//           Start MyAnimeList Stuff           //
		/////////////////////////////////////////////////
		// Lord have mercy on anyone who tries to make //
		//     sense of anything in this section.      //
		/////////////////////////////////////////////////

		chrome.storage.local.get(['enableMALAPI', 'MALLoggedIn'], function(items) {

			if (items.enableMALAPI === true && items.MALLoggedIn === true) {

				$('#malContainer').append(`
					<div class="loading-mal" style="text-align:center">
						<div class="loading-pulse" style="margin:auto"></div>
						<div class="loading-pulse-text" style="margin-top:5px">Searching MyAnimeList</div>
					</div>
				`);

				var AnimeTitles = otherNames;

				chrome.runtime.sendMessage({
					MALv2: {
						type: 1,
						titles: AnimeTitles,
						path: window.location.pathname
					}
				}, function(response) {
					$('.loading-mal').remove();
					if (response.success) malAPIv2(response);
					// else if (!response.success && response.error !== 404) malSearch();
					if (!response.success && response.error === 429) toastr.error(response.data, 'MyAnimelist Integration', { timeOut: "15000", extendedTimeOut: "15000", positionClass: "toast-top-right" });
				});

			}

		});

		function malAPIv2(response) {

			"use strict"; // Fuck it

			console.log('%c KissEssentials %c MyAnimeList Data ', logStyleBeginning, logStyleEnd, response);

			// $('#malContainer').show();

			let id = parseInt(response.data.mal.id);
			var inUserMAL = response.data.user ? true : false;
			var inDB = response.data.inDB;

			$('#malContainer').empty().prepend(`

				<span id="addRemoveMALContainer" class="KEPad">
					<img id="addRemoveMALImg" class="KEImg" src="/Content/images/plus.png">
					<a id="addRemoveMAL" href="javascript:void(0)"></a>
				</span>

				<span id="statusMALContainer" class="KEPad KEHide">
					<span>Your Status: </span>
					<select id="statusDropdown" class="KEDropdown">
						<option value="1">Watching</option>
						<option value="2">Completed</option>
						<option value="3">On Hold</option>
						<option value="4">Dropped</option>
						<option value="6" selected>Plan To Watch</option>
					</select>
				</span>

				<span id="scoreMALContainer" class="KEPad KEHide">
					<span>Your Score: </span>
					<select id="scoreDropdown" class="KEDropdown">
						<option value="0" selected>-</option>
						<option value="10">10</option>
						<option value="9">9</option>
						<option value="8">8</option>
						<option value="7">7</option>
						<option value="6">6</option>
						<option value="5">5</option>
						<option value="4">4</option>
						<option value="3">3</option>
						<option value="2">2</option>
						<option value="1">1</option>
					</select>
				</span>

				<span id="episodeMALContainer" class="KEPad KEHide">
					<span>Eps Seen:</span>
					<input type="number" id="episodesUserCurrentText" class="KETextInput" style="border: 1px solid grey;" value="0" min="0">
					<span>/</span>
					<input type="text" id="episodesTotalText" class="KETextInput" disabled>
				</span>

				<span id="userDate" class="KEPad KEHide">
					<span>Started:</span>
					<select id="startMonth" class="KEDropdown monthSelection">
						<option value="00" selected>- Month -</option>
						<option value="01">January</option>
						<option value="02">Febuary</option>
						<option value="03">March</option>
						<option value="04">April</option>
						<option value="05">May</option>
						<option value="06">June</option>
						<option value="07">July</option>
						<option value="08">August</option>
						<option value="09">September</option>
						<option value="10">October</option>
						<option value="11">November</option>
						<option value="12">December</option>
					</select>
					&nbsp;
					<select id="startDay" class="KEDropdown dateSelection">
						<option value="00" selected>- Day -</option>
					</select>
					&nbsp;
					<select id="startYear" class="KEDropdown yearSelection">
						<option value="0000" selected>- Year -</option>
					</select>
					&nbsp;
					<span>Finished:</span>
					<select id="endMonth" class="KEDropdown monthSelection">
						<option value="00" selected>- Month -</option>
						<option value="01">January</option>
						<option value="02">Febuary</option>
						<option value="03">March</option>
						<option value="04">April</option>
						<option value="05">May</option>
						<option value="06">June</option>
						<option value="07">July</option>
						<option value="08">August</option>
						<option value="09">September</option>
						<option value="10">October</option>
						<option value="11">November</option>
						<option value="12">December</option>
					</select>
					&nbsp;
					<select id="endDay" class="KEDropdown dateSelection">
						<option value="00" selected>- Day -</option>
					</select>
					&nbsp;
					<select id="endYear" class="KEDropdown yearSelection">
						<option value="0000" selected>- Year -</option>
					</select>
					&nbsp;
					<button type="button" id="saveDates" class="KEDropdown">Update Dates</button>
				</span>

				<span id="findinMALContainer" class="KEPad">
					<img id="MALImage" class="KEImg" src="${chrome.runtime.getURL('images/mal-icon.png')}">
					<a href="https://myanimelist.net/anime/${id}" target="_blank">MAL Page</a>
				</span>

				<span id="totalScoreMALContainer" class="KEPad">
					<span class="info">MAL Score: </span>
					<span id="malScore">N/A</span>
				</span>

			`);

			// if (!inDB) $('#malContainer').append('<span id="malNotice">Notice!</span>')

			if (response.data.mal.score) $('#malScore').text(response.data.mal.score);

			if (inUserMAL) {

				$('#addRemoveMAL').text('Remove From MAL'); // Changes the Text
				$('#addRemoveMALImg').attr('src', '/Content/images/minus.png'); // Changes the Img
				$('#statusDropdown').val(response.data.user.data.my_status); // Adds the value for the Current Status
				$('#scoreDropdown').val(response.data.user.data.my_score); // Adds the value for the Current Score
				$('#episodesUserCurrentText').val(response.data.user.data.my_watched_episodes); // Adds the value for the Current Episode
				if (parseInt(response.data.user.data.series_episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.user.data.series_episodes); // Sets the max input value if the total episodes does not equal 0
				$('#episodesTotalText').val(response.data.user.data.series_episodes); // Adds the value for the Total Episodes

				for (let i = 1; i <= 31; i++) {

					var day = i;
					if (day.toString().length == 1) day = '0' + day;
					$('#startDay').append(`<option value=${day}>${i}</option>`);
					$('#endDay').append(`<option value=${day}>${i}</option>`);

				}

				for (let i = new Date().getFullYear(); i >= 1980; i--) {

					$('#startYear').append(`<option value=${i}>${i}</option>`);
					$('#endYear').append(`<option value=${i}>${i}</option>`);

				}

				var startDate = response.data.user.data.my_start_date.split('-');
				$('#startMonth').val(startDate[1]);
				$('#startDay').val(startDate[2]);
				$('#startYear').val(startDate[0]);

				var endDate = response.data.user.data.my_finish_date.split('-');
				$('#endMonth').val(endDate[1]);
				$('#endDay').val(endDate[2]);
				$('#endYear').val(endDate[0]);

				$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').removeClass('KEHide'); // Shows every container

			} else {

				$('#addRemoveMAL').text('Add To MAL');
				$('#addRemoveMALImg').attr('src', '/Content/images/plus.png');
				if (parseInt(response.data.mal.episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.mal.episodes);
				$('#episodesTotalText').val(parseInt(response.data.mal.episodes));

			}

			/* == Add/Remove from MyAnimeList == */
			$('#addRemoveMAL').click(function() {

				if (inUserMAL) {

					createDialog(`Are you sure you wish to remove <span style="color:yellow">${AnimeTitle}</span> from your MyAnimeList?`, 'Confirmation', 'Yes', 'No', function() {

						chrome.runtime.sendMessage({ MALv2: { type: 3, id: id } }, function(response) {

							console.log('Remove Status:', response);

							if (response.success) {

								inUserMAL = false;
								$('#addRemoveMAL').text('Add To MAL');
								$('#addRemoveMALImg').attr('src', '/Content/images/plus.png');

								/* == Set Defaults == */
								$('#statusDropdown').val('6'); $('#scoreDropdown').val('0');
								$('#episodesUserCurrentText').val('0');
								$('.dateSelection, .monthSelection').val('00');
								$('.yearSelection').val('0000');

								$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').addClass('KEHide');

								toastr['success']('Removed from MyAnimeList!');

							} else toastr['error'](response.data);

						});

					});

				} else {

					chrome.runtime.sendMessage({ MALv2: { type: 2, id: id } }, function(response) {

						console.log('Add Status', response);

						if (response.success) {

							inUserMAL = true;
							$('#addRemoveMAL').text('Remove From MAL');
							$('#addRemoveMALImg').attr('src', '/Content/images/minus.png');

							for (let i = 1; i <= 31; i++) {

								var day = i;
								if (day.toString().length == 1) day = '0' + day;
								$('#startDay').append(`<option value=${day}>${i}</option>`);
								$('#endDay').append(`<option value=${day}>${i}</option>`);

							}

							for (let i = new Date().getFullYear(); i >= 1980; i--) {

								$('#startYear').append(`<option value=${i}>${i}</option>`);
								$('#endYear').append(`<option value=${i}>${i}</option>`);

							}

							$('#statusMALContainer, #scoreMALContainer, #episodeMALContainer, #userDate').removeClass('KEHide');

							toastr['success']('Added to MyAnimeList!');

						} else toastr['error'](response.data);

					});

				}

			});

			/* == Update Status == */
			$('#statusDropdown').on('change', function() {

				console.log(this.value);

				chrome.runtime.sendMessage({ MALv2: { type: 5, id: id, status: this.value } }, function(response) {

					console.log('Update Status:', response);

					if (response.success) toastr['success']('Status Updated!');
					else toastr['error'](response.data);

				});

			});

			/* == Update Score == */
			$('#scoreDropdown').on('change', function() {

				console.log(this.value);

				chrome.runtime.sendMessage({ MALv2: { type: 6, id: id, score: this.value } }, function(response) {

					console.log('Score Status:', response);

					if (response.success) toastr['success']('Score Updated!');
					else toastr['error'](response.data);

				});

			});

			/* == Previous Episode Number == */
			var currentEpisodeValue;

			/* ==  == */
			$('#episodesUserCurrentText').on('focus', function() {

				currentEpisodeValue = this.value;

				$(this).animate({'width': '40px'});

			});

			/* == Update Episode == */
			$('#episodesUserCurrentText').on('blur', function() {

				$(this).animate({'width': '25px'});

				if (currentEpisodeValue != this.value) {

					chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: this.value } }, function(response) {

						console.log('Episode Status:', response);

						if (response.success) toastr['success']('Episode Updated!');
						else toastr['error'](response.data);

					});

				}

			});

			$('#saveDates').click(function() {

				var startDate = $('#startMonth').val() + $('#startDay').val() + $('#startYear').val();
				var endDate = $('#endMonth').val() + $('#endDay').val() + $('#endYear').val();

				$('html').css('cursor', 'progress');

				chrome.runtime.sendMessage({ MALv2: { type: 7, id: id, dates: [startDate, endDate] } }, function(response) {

					if (response.success) toastr['success']('Dates Updated!');
					else toastr['error'](response.data);

					$('html').css('cursor', 'default');

				});

			});

		}

		///////////////////////////////////////////////
		//           End MyAnimeList Stuff           //
		///////////////////////////////////////////////

		///////////////////////
		// Start Kitsu Stuff //
		///////////////////////

		function kitsuSearch() {

			var AnimeTitles = otherNames;

			chrome.runtime.sendMessage({
				kitsu: {
					type: 1,
					titles: AnimeTitles,
					path: window.location.pathname
				}
			}, function(response) {

				if (response.success) {

					var kitsuData = response.data.kitsu;

					$('#kitsuLink').text('Kitsu Page').attr('href', 'https://kitsu.io/anime/' + kitsuData.attributes.slug);

					$('#kitsuScore').text(Math.floor(kitsuData.attributes.averageRating)/10 || 'N/A');

					$('#kitsuContainer').show();

				} else {

					$('#kitsuLink').text('Find in Kitsu').attr('href', 'https://kitsu.io/anime?text=' + encodeURIComponent(AnimeTitle));

					$('#kitsuScore').text('N/A');

					$('#kitsuContainer').show();

				}

			});

		}

		/////////////////////
		// End Kitsu Stuff //
		/////////////////////

		/////////////////////////
		// Start Anilist Stuff //
		/////////////////////////

		// Todo
		// - Figure out how oAuth2 works.
		// - The above x2

		///////////////////////
		// End Anilist Stuff //
		///////////////////////

		///////////////////////////////////
		// Search for Reddit Discussions //
		///////////////////////////////////

		var searchTemplate = 'subreddit:anime self:yes title:"[Spoilers]" (selftext:MyAnimeList OR selftext:MAL) ';
		var searchTitles = [];
		for (var title of otherNames) searchTitles.push(`title:"${title.replace('(TV)', '')}"`);
		var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+searchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

		var reddit_logo = chrome.extension.getURL('images/reddit-icon.png');
		$('#redditThreadContainer').append(`<img id="RedditImage" class="KEImg" src=${reddit_logo}>`);
		$('#redditThreadContainer').append(`<a id="RedditLink" href="${searchQuery}" target="_blank">Reddit Discussions</a>`);

		function redditDiscussionLinks() {

			$('.listing td:first-child').each(function() {

				var element = $(this).find('a');
				var episode = $(element).text().split('Episode').pop();
				episode = parseInt(episode);

				if (!episode) return;

				var episodeSearchTitles = [];
				for (title of otherNames) episodeSearchTitles.push(`title:"${title.replace('(TV)', '')} - Episode ${episode}"`);
				var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+episodeSearchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

			 	$(element).after(` - <a href="${searchQuery}" target="_blank">Reddit Discussion</a>`);

			});

		}

		/////////////////////////
		// Pinned List Manager //
		/////////////////////////

		$('#redditThreadContainer').after('<span id="PinnedManager"  class="KEPad"></span>');
		$('#PinnedManager').append('<img id="PMimg" class="KEImg" src="/Content/images/plus.png">');
		$('#PinnedManager').append('<a id="PinnedManagerText">Pin to Homepage</a>');
		$('#PinnedManagerText').css("cursor","pointer");
		
		var imgURL = $('#rightside .barContent img').first().attr('src');

		chrome.storage.sync.get('PinnedListURLs', function(items) {
			if (items.PinnedListURLs != null && $.inArray(window.location.pathname, items.PinnedListURLs) > -1) {
				$('#PinnedManagerText').text('Unpin from Homepage');
				$('#PMimg').attr('src', '/Content/images/minus.png');
			}
		});

		$('#PinnedManagerText').click(function() {

			chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

				if (items.PinnedList == null) { // If Pinned List doesn't exist. i.e New User

					var PinnedList = [AnimeTitleRaw];
					var PinnedListURLs = [window.location.pathname];
					var PinnedListLW = [null];
					var PinnedListImg = [imgURL];

					$('#PinnedManagerText').text('Unpin from Homepage');
					$('#PMimg').attr('src', '/Content/images/minus.png');

					chrome.storage.sync.set({
						PinnedList: PinnedList,
						PinnedListURLs: PinnedListURLs,
						PinnedListLW: PinnedListLW,
						PinnedListImg: PinnedListImg
					});

				} else if (items.PinnedListURLs.includes(window.location.pathname)) { // If Anime exist in Pinned List

					var PinnedList = items.PinnedList;
					var PinnedListURLs = items.PinnedListURLs;
					var PinnedListLW = items.PinnedListLW;
					var PinnedListImg = items.PinnedListImg;
					var AnimePos = items.PinnedListURLs.indexOf(window.location.pathname);

					PinnedList.splice( AnimePos, 1 );
					PinnedListURLs.splice( AnimePos, 1 );
					PinnedListLW.splice( AnimePos, 1 );
					PinnedListImg.splice( AnimePos, 1 );

					$('#PMimg').attr('src', '/Content/images/plus.png');
					$('#PinnedManagerText').text('Pin to Homepage');

					chrome.storage.sync.set({
						PinnedList: PinnedList,
						PinnedListURLs: PinnedListURLs,
						PinnedListLW: PinnedListLW,
						PinnedListImg: PinnedListImg
					});

				} else { // If Anime doesn't exist in Pinned List

					if ( items.PinnedList.length <= 70 ) {

						var PinnedList = items.PinnedList;
						var PinnedListURLs = items.PinnedListURLs;
						var PinnedListLW = items.PinnedListLW;
						var PinnedListImg = items.PinnedListImg;

						PinnedList.push( AnimeTitleRaw.trim() );
						PinnedListURLs.push(window.location.pathname);
						PinnedListLW.push(null);
						PinnedListImg.push(imgURL);

						$('#PinnedManagerText').text('Unpin from Homepage');
						$('#PMimg').attr('src', '/Content/images/minus.png');

						chrome.storage.sync.set({
							PinnedList: PinnedList,
							PinnedListURLs: PinnedListURLs,
							PinnedListLW: PinnedListLW,
							PinnedListImg: PinnedListImg
						});

					} else {

						toastr['error']('Max Pinned List Items Reached! 70/70', '', {positionClass: "toast-top-center"});

					}
				}

			});

		});

		// Color in the console //
		function colorLog(text, color) {
			console.log(`%c${text}`, `color:${color}`);
		}

	});

}
