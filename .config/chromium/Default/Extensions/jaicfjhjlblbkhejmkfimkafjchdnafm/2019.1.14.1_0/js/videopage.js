var storage = chrome.storage;

$(function() {

	$('head').inject('inline-script', function() {
		window.videojs.plugin('progressTips', function() {}); // Clears the old plugin
	});

	/* $('head').inject('inline-script', function makeAnimeGreatAgain() {
		console.log('%cEssentials for KissAnime: DoDetect+ functions overwritten!', 'color:blue');
	}); */

});

$(document).ready(function() {

	storage.sync.get({ enableCustomPlayer: true }, function(items) {

		if (!items.enableCustomPlayer) {

			$('body').addClass('playerDisabled');

			console.log('%c KissEssentials %c Custom Player Disabled ', logStyleBeginning, logStyleEnd);

			return;

		}

		$('head').append('<style id="style-iframe">#divContentVideo iframe {display: none}</style>');

		$('#divContentVideo').append('<div id="loadingVideo"><div class="loading-pulse loading-pulse-absolute"></div><div class="loading-pulse-text">Loading Video...</div></div>');

		if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == 'openload.co' ) {

			window.videohost = 'Openload';

			var openloadTimeout = setTimeout(fallback, 10000);

			window.addEventListener('message', function(e) {

				if (e.origin === 'https://openload.co' || e.origin === 'https://oload.stream' || e.origin === 'https://oload.site') {

					if (e.data[0] == 'OpenloadURL') {
						clearTimeout(openloadTimeout);
						console.log(e.data);
						$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${e.data[1]} autoplay controls preload="auto" width="854px" height="552px"><source src=${e.data[1]} type="video/mp4"></video>`);
						$('iframe[src*="openload.co"]').remove();
						doVideoJS();
					}

				}

			});

		} else if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == 'www.rapidvideo.com' ) {

			window.videohost = 'RapidVideo.com';

			var rapidVideoTimeout = setTimeout(fallback, 15000);

			window.addEventListener('message', function (e) {

				if (e.origin !== 'https://www.rapidvideo.com') return;

				if (e.data[0] == 'RapidVideoURL') {

					clearTimeout(rapidVideoTimeout);
					console.log(e.data);
					$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${e.data[1].src} autoplay controls preload="auto" width="854px" height="552px"><source src=${e.data[1].src} type="video/mp4"></video>`);
					$('iframe[src*="rapidvideo.com"]').remove();
					doVideoJS();

				}

			});

		} else if ( /(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == 'streamango.com' ) {

			window.videohost = 'Streamango.com';

			var streamangoTimeout = setTimeout(fallback, 10000);

			window.addEventListener('message', function(e) {

				if (e.origin !== 'https://streamango.com') return;

				if (e.data[0] == 'StreamangoURL') {

					var sources = e.data[1].map(function(source) {
						return { src: source.src, label: source.height + 'p' };
					});

					if (sources.length === 0) return fallback();

					clearTimeout(streamangoTimeout);
					console.log(e.data);
					$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${sources[sources.length - 1].src} autoplay controls preload="auto" width="854px" height="552px"><source src=${sources[sources.length - 1].src} type="video/mp4"></video>`);
					$('iframe[src*="streamango.com"]').remove();
					doVideoJS(sources);

				}

			});

		} else if (/(?:[\w-]+\.)+[\w-]+/.exec($('#divContentVideo iframe').attr('src')) == 'www.mp4upload.com') {

			fallback();

			/* window.videohost = 'mp4Upload';

			var mp4UploadTimeout = setTimeout(fallback, 10000);

			window.addEventListener('message', function(e) {

				if (e.origin === "https://www.mp4upload.com") {

					if (e.data[0] == 'MP4UploadURL') {
						clearTimeout(mp4UploadTimeout);
						console.log(e.data);
						$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src=${e.data[1]} autoplay controls preload="auto" width="854px" height="552px"><source src=${e.data[1]} type="video/mp4"></video>`);
						$('iframe[src*="mp4upload.com"]').remove();
						doVideoJS();
					}

				}

			}); */

		} else {

			window.videohost = 'KissAnime';

			if ( $('#selectPlayer').val() == 'html5' ) {

				var isAutoplay;
				if (!Cookies.get('usernameK')) isAutoplay = 'autoplay';
				else isAutoplay = $('#my_video_1_html5_api').attr('autoplay') || '';

				var videoURL = $('#my_video_1_html5_api').attr('src');

				console.log(videoURL);

				$('body').inject('inline-script', function() {
					myPlayer.dispose(); // Completely remove the old player. Cause why the fuck not.
				});

				$('#my_video_1').remove();

				$('#divContentVideo').append(`<video id="my_video_1" class="video-js vjs-default-skin vjs-big-play-centered" src="${videoURL}" ${isAutoplay} controls preload="auto" width="854px" height="552px"><source src="${videoURL}" type="video/mp4"></video>`);

				// doVideoJS();

				setTimeout(() => doVideoJS(), 1000); // Timeout is required to allow the chromecast plugin time to load.

			} else if ( $('#selectPlayer').val() == 'flash' ) {

				startVideopageJS();

			}

		}

	});

	function fallback() {
		$('#my_video_1').show();
		$('#loadingVideo, #style-iframe').remove();
		startVideopageJS();
	}

	function doVideoJS(sources) {

		if (sources && sources.length > 0) {

			$('body').append('<select id="slcQualix" class="selectQuality"></select>');

			for (var source of sources) {
				$('.selectQuality').append(`<option value="${source.src}">${source.label}</option>`);
			}

			$('.selectQuality').change(function() {
				var player = $('#my_video_1_html5_api')[0];
				var oldTime = player.currentTime;
				player.src = this.value;
				player.play();
				$(player).on('loadedmetadata', function() {
					player.currentTime = oldTime;
				});
			});

		}

		$('#loadingVideo').remove();

		$('body').inject('inline-script', function startVideoJS() {

			videojs(document.getElementById('my_video_1'), {
				techOrder: ['html5'],
				nativeControlsForTouch: false,
				playbackRates: [0.5, 1, 1.5, 2, 2.5, 3],
				controlBar: {
					/* children: [
						"PlayToggle",
						"VolumePanel",
						"CurrentTimeDisplay",
						"TimeDivider",
						"DurationDisplay",
						"ProgressControl",
						"RemainingTimeDisplay",
						"CustomControlSpacer",
						"PlaybackRateMenuButton",
					] */
					children: [
						'PlayToggle',
						'CurrentTimeDisplay',
						'TimeDivider',
						'DurationDisplay',
						'TimeDivider',
						'RemainingTimeDisplay',
						// "PlaybackRateMenuButton",
						'progressControl',
						'FullscreenToggle',
						'VolumeControl',
						'muteToggle',
					]
				}
			});

			window.myPlayer = videojs('my_video_1');

			myPlayer.ready(function() {

				$('.barContent #centerDivVideo, .barContent #divContentVideo, .barContent  #my_video_1').css({
					'height': '504px',
					'width': '896px'
				});

				this.hotkeys({
					volumeStep: 0.1,
					seekStep: 3,
					enableMute: true,
					enableFullscreen: true,
					enableNumbers: true
				});

				var currentTimeInt;

				myPlayer.on('timeupdate', function() {
					if (this.duration() !== 0 && this.currentTime() > 1)
						currentTimeInt = this.currentTime();
				});

				$('#my_video_1').append('<div id="videoMessage">');

				var videoMessage = {
					set: function(message) {
						$('#videoMessage').css('display', 'flex').text(message);
						$('.vjs-error-display').addClass('vjs-hidden');
					},
					remove: function() {
						$('#videoMessage').hide().text('');
					}
				};

				var errorCount = 0;
				var maxErrors = 150;

				myPlayer.on('error', function(error, a) {
					if (errorCount < maxErrors) {

						myPlayer.load();

						myPlayer.one('canplay', function() {
							if (currentTimeInt !== 0) this.currentTime(currentTimeInt);
						});

						errorCount++;

						videoMessage.set(`Retrying ${errorCount}/${maxErrors}`);

					} else {

						if (!window.location.search.includes('pfail')) {
							location.href = window.location.href + '&pfail=3';
						} else {
							videoMessage.set('Could not load the video, please try again or change server.');
						}

						return;

					}
				});

				myPlayer.on('loadedmetadata', function() {
					videoMessage.remove();
					errorCount = 0;
				});

				$('.vjs-control-bar').prepend('<div class="vjs-control-bar-shadow"></div>');

				/* == Moves the Quality Selector to the Player Control bar == */
				var qualitySelector = $('.selectQuality').detach();
				$('#divQuality').remove();
				$('.vjs-mute-control').after(qualitySelector);
				if ($('.selectQuality').length) $('#videoRefresh').css('padding-right', '10px');

				/* Shows the player once it's ready. Did this because I couldn't figure out how to not make it look fugly when loading. */
				$('#my_video_1').show();

				console.log('Player Ready');

			});


		});

		startVideopageJS();

	}

	function startVideopageJS() {

		///////////////////////////////////////////////
		// Things that are used throughout this file //
		///////////////////////////////////////////////

		var currentPlayer = $('#selectPlayer').val(); // Gets the Current Player Type
		var currentServer = getParameterByName( 's' , $('#selectServer').val() );

		var isHTML5 = ((currentPlayer =='html5' && $('#my_video_1_html5_api').length) || ( (currentServer == 'openload' || currentServer == 'stream') && $('#my_video_1_html5_api').length ) ? true : false );
		var isIFrame = /openload|rapidvideo|streamango/i.test(currentServer);

		console.log('Is HTML5 Player:', isHTML5);
		console.log('Is iFrame Player:', isIFrame);

		var centerDivVideo = $('#centerDivVideo');
		var currentAnimeURL = $('#navsubbar a').attr('href');
		var AnimeTitle = $('#navsubbar a').text().replace('information', '').replace('Anime', '').trim();
		var currentEpisode = $('#selectEpisode option:selected').text().trim();

		$('#selectEpisode').parent().parent().attr('id', 'selectEpisodeContainer');
		$('#switch').parent().attr('id', 'playerSwitchLightsOffContainer');
		$('#selectEpisodeContainer').append('<div class="clear"></div>');

		$('#playerSwitchLightsOffContainer').append('<div style="clear:both"></div>');

		$('#playerSwitchLightsOffContainer').detach().insertAfter('#centerDivVideo');
		$('#playerSwitchLightsOffContainer').css('margin-top', '10px');

		$('#divQuality > select').addClass('selectQuality');

		////////////////////////////////////////////
		// Overwrite KissAnime DoDetect functions //
		////////////////////////////////////////////

		chrome.storage.sync.get(function(items) {

			/////////////////////////////
			// REMOVE PLAYER SWITCHERS //
			/////////////////////////////

			if (items.enablePlayerSwitchers == false) $('#playerSwitchLightsOffContainer > div:first-child').hide();

			///////////////////////
			// REMOVE LIGHTS OFF //
			///////////////////////

			// if (items.enableLightsOff == false) $('#switch').style('display', 'none', 'important');
			if (items.enableLightsOff == false) $('#switch').hide();

			///////////////////////////
			// REMOVE DOWNLOAD LINKS //
			///////////////////////////

			if (items.enableDownloadLinks == false) $('#divDownload').hide();

			///////////////////////
			// REMOVE FILE NAMES //
			///////////////////////

			if (items.enableFileName == false) {
				var bookmarklink = $('#divBookmark').detach();
				$('#divFileName').empty();
				$('#divFileName').append(bookmarklink);
			}

			//////////////////////////////////////
			// DISABLE VIDEO PAGE BOOKMARK LINK //
			//////////////////////////////////////

			if (items.enableBookmarkLink == false) $('#divBookmark').hide();

		});

		///////////////////////////
		// Refreshes HTML5 Video //
		///////////////////////////

		if (isHTML5) {

			$('.vjs-mute-control').after('<div id="videoRefresh">Reload Video</div>');

			$('#videoRefresh').css({
				'float': 'right',
				'position': 'relative',
				'top': '5px',
				'cursor': 'pointer',
				'line-height': '18px'
			});

			var currentTimeInt = 0;

			$('#my_video_1_html5_api').on('timeupdate', function() {
				if (this.duration !== 0 && this.currentTime > 1)
					currentTimeInt = document.getElementById('my_video_1_html5_api').currentTime;
			});

			$('#videoRefresh').click(function() {
				document.getElementById('my_video_1_html5_api').load();
				$('#my_video_1_html5_api').one('canplay', function() {
					this.currentTime = currentTimeInt;
				});
			});

		}

		//////////////////////////////////////////////
		// Custom Context Menu for HTML5 Video Page //
		//////////////////////////////////////////////

		if (isHTML5) {
			$('#my_video_1').append('<div id="contextmenu" class="contextmenu"></div>');
			$('#contextmenu').load(chrome.runtime.getURL('InjectedHTML/VideoPageContextMenu.html'), function() {
				var html5player = $('#my_video_1_html5_api');
				$('html').on('click', function() {
					if ($('#contextmenu').is(':visible') == true) {
						$('#contextmenu').hide();
					}
				});
				html5player.on('contextmenu', function(e) {
					$('.contextmenu').hide();
					$('#contextmenu').show();
					$('#contextmenu').offset({ top: e.pageY, left: e.pageX});
					event.preventDefault();
				});
				$(window).resize(function() {
					$('.contextmenu').hide();
				});
				$('.ccmLoop').click(function() {
					if (html5player.attr('loop')) {
						html5player.attr('loop', false);
						$(this).removeClass('active');
					} else {
						html5player.attr('loop', true);
						$(this).addClass('active');
					}
				});
				$('.ccmControls').click(function() {
					if (html5player.attr('controls')) {
						html5player.attr('controls', false);
						$(this).removeClass('active');
					} else {
						html5player.attr('controls', true);
						$(this).addClass('active');
					}
				});
				$('.ccmVJSControls').click(function() {
					if ($('.vjs-control-bar').is(':visible')) {
						$('.vjs-control-bar').hide();
						$(this).addClass('active');
					} else {
						$('.vjs-control-bar').show();
						$(this).removeClass('active');
					}
				});
				// Control Bar //
				var controlbar = $('.vjs-control-bar');
				controlbar.attr('data-postion', 'bottom');
				chrome.storage.sync.get('html5ControlsPos', function(items) {
					if (items.html5ControlsPos) {
						if (items.html5ControlsPos == 'bottom') {
							$('.ccmCPContainer .option').removeClass('active');
							$('.ccmCPBottom').addClass('active');
							controlbar.attr('data-postion', 'bottom').removeClass('controlTop');
							$('#statusStyle').remove();
						} else {
							$('.ccmCPContainer .option').removeClass('active');
							$('.ccmCPTop').addClass('active');
							controlbar.attr('data-postion', 'top').addClass('controlTop');
							$('head').append('<style id="statusStyle">#status { bottom:5px; top:initial !important; }</style>');
						}
					} else {
						controlbar.attr('data-postion', 'bottom');
					}
				});

				$('.ccmControlsPos, .ccmCPContainer').hover(function() {
					$('.ccmCPContainer').show();
				}, function() {
					$('.ccmCPContainer').hide();
				});
				$('.ccmCPBottom').click(function() {
					if (controlbar.attr('data-postion') != 'bottom') {
						chrome.storage.sync.set({html5ControlsPos: 'bottom'});
						$('.ccmCPContainer .option').removeClass('active');
						$(this).addClass('active');
						controlbar.attr('data-postion', 'bottom').removeClass('controlTop');
						$('#statusStyle').remove();
					}
				});
				$('.ccmCPTop').click(function() {
					if (controlbar.attr('data-postion') != 'top') {
						chrome.storage.sync.set({html5ControlsPos: 'top'});
						$('.ccmCPContainer .option').removeClass('active');
						$(this).addClass('active');
						controlbar.attr('data-postion', 'top').addClass('controlTop');
						$('head').append('<style id="statusStyle">#status { bottom:5px; top:initial !important; }</style>');
					}
				});

				// Open in New Tab //
				$('.ccmTab').click(function() {
					window.open(html5player.attr('src'));
				});

				$(document).on('click', '.ccmWindow', function() {
					window.open($('#my_video_1_html5_api').attr('src'), 'KissAnime', 'width=1280, height=720');
				});

				// Save Video As... //
				if (html5player.attr('src').indexOf('googlevideo.com') > -1) {
					$('.ccmSave').attr('href', html5player.attr('src') + '&title=' + encodeURI(AnimeTitle+' '+currentEpisode+' ['+$('.selectQuality option:selected').text()+']'));
					$('.selectQuality').on('change', function() {
						$('.ccmSave').attr('href', html5player.attr('src') + '&title=' + encodeURI(AnimeTitle+' '+currentEpisode+' ['+$('.selectQuality option:selected').text()+']'));
					});
				} else {
					$('.ccmSave').attr('href', html5player.attr('src'));
					$('.selectQuality').on('change', function() {
						$('.ccmSave').attr('href', html5player.attr('src'));
					});
				}

				// Copy Video URL //
				$('.ccmVideoURL').click(function() {
					copyText(html5player.attr('src'));
				});

				// Copy Page URL //
				$('.ccmPageURL').click(function() {
					copyText(window.location.href);
				});

				// Copy Page URL at Current Time //
				$('.ccmPageURLTime').click(function() {
					copyText(window.location.href.replace(/&?time=([^&]$|[^&]*)/i, '') + '&time=' + html5player[0].currentTime);
				});

				// Restart Video //
				$('.ccmRestart').click(function() {
					html5player[0].currentTime = 0;
				});
			});
		}

		///////////////////////////////////////////////
		// Stores episode link in PinnedListLW array //
		///////////////////////////////////////////////

		$(window).on('beforeunload', function() {
			chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW'], function(items) {

				var animePath = window.location.pathname.replace(/\/[^\/]+$/, '');
				var currentPath = window.location.pathname + window.location.search.replace(/(\?|&)(?!id)([^=]+)=([^&]+)/gi, '');

				if (items.PinnedListURLs.includes(animePath)) {

					var animePos = items.PinnedListURLs.indexOf(animePath);
					var nextAnime = $('#selectEpisode option:selected').next();
					var videoPlayer = document.getElementById('my_video_1_html5_api');

					if (videoPlayer.duration - 160 < videoPlayer.currentTime) {

						if (nextAnime.length) {

							items.PinnedListLW[animePos] = {
								episode: nextAnime.text().trim(),
								path: animePath + '/' + nextAnime.val(),
								continuing: false
							};

						} else {

							items.PinnedListLW[animePos] = null;

						}

					} else if (videoPlayer.ended == false) {

						items.PinnedListLW[animePos] = {
							episode: currentEpisode,
							path: currentPath + '&time=' + videoPlayer.currentTime,
							continuing: true
						};

					}

					chrome.storage.sync.set({ PinnedListLW: items.PinnedListLW });

				}

			});
		});

		//////////////////////////////////////////////
		// Add Reddit Discussion Link to Video Page //
		//////////////////////////////////////////////

		chrome.storage.sync.get('enableFindRedditDiscussions', function(items) {
			if (items.enableFindRedditDiscussions == true) {
				$.ajax({
					url: currentAnimeURL,
					success: function(data) {

						var AnimeTitle = $(data).find('.barContent > div > a.bigChar').text().replace('(Sub)', '').replace('(Dub)', '');
						var otherNames = [AnimeTitle];

						$(data).find('span:contains("Other name:")').parent().find('a').each(function() {
							otherNames.push($(this).text());
						});

						var episode = $('#selectEpisode > :selected').text().trim().split('Episode').pop();
						episode = parseInt(episode);
						if (!episode) return;

						var episodeSearchTitles = [];
						for (var title of otherNames) episodeSearchTitles.push(`title:"${title.replace('(TV)', '')} - Episode ${episode}"`);
						var searchTemplate = 'subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]" (selftext:MyAnimelist OR selftext:MAL) ';
					 	var searchQuery = `https://reddit.com/r/anime/search?q=${encodeURIComponent(searchTemplate+'('+episodeSearchTitles.join(' OR ')+')')}&restrict_sr=on&sort=new&t=all`;

						 $('#divFileName').after(`<div>
							<img src="${chrome.extension.getURL('images/reddit-icon.png')}" style="vertial-align: sub; padding-right: 5px;">
							<a href="${searchQuery}" target="_blank">Reddit Discussion</a>
						</div>`);

					},
					error: function() {
						$.ajax(this);
					}
				});
			}
		});

		//////////////////////////////////
		// Enables Auto Episode Advance //
		//////////////////////////////////

		if (isHTML5)
			console.debug('HTML5 Player');
		else if ( $('#divContentVideo iframe').length )
			console.debug('iFrame Player');

		if (isHTML5) {
			chrome.storage.sync.get('enableAutoAdvEp', function(items) {
				if (items.enableAutoAdvEp == true) {
					$('#my_video_1_html5_api').on('ended', function() {
						$('#btnNext').click();
					});
				}
			});
		}

		////////////////////////
		// Custom Video Speed //
		////////////////////////

		chrome.storage.sync.get(['enablePlaybackRate', 'enableKeyboardShortcuts'], function(items) {
			if (items.enablePlaybackRate == true) {

				if (isHTML5) {
					$('head').inject('css', chrome.runtime.getURL('/assets/css/PBRSlider.css'));
					$('.vjs-remaining-time').after('<div id="playbackRateContainer" style="display:none"></div>');
					$('#playbackRateContainer').append('<div id="playbackRateSlider"></div>');
					$('#playbackRateContainer').append('<div id="sliderValue">1.0x</div>');
					$('#playbackRateSlider').slider({
						slide: function( event, ui ) {
							$('#sliderValue').text(ui.value+'x');
							document.getElementById('my_video_1_html5_api').playbackRate = ui.value;
						},
						change: function(event, ui) {
							$('#sliderValue').text(ui.value+'x');
							document.getElementById('my_video_1_html5_api').playbackRate = ui.value;
						},
						max: 3,
						min: 0,
						value: 1,
						step: .05
					});
					$('#playbackRateSlider').click(function() {
						event.stopPropagation();
					});

					$('#my_video_1_html5_api').on('loadedmetadata', function() {
						$('#my_video_1_html5_api')[0].playbackRate = $('#playbackRateSlider').slider('value');
					});
				}

			}
		});

		////////////////////
		// ENABLE AUTO HD //
		////////////////////

		chrome.storage.sync.get('enableAutoHD', function(items) {

			if (items.enableAutoHD == true) {

				if (isHTML5) {

					$('body').inject('inline-script', function() {

						var highestQuality = $('#slcQualix option')[0].value;

						$('.selectQuality').val(highestQuality);

						$('.selectQuality').change();

					});

				}

			}

		});

		/////////////////////////////
		// Enable Auto Low Quality //
		/////////////////////////////

		chrome.storage.sync.get('enableAutoLQ', function(items) {

			if (items.enableAutoLQ == true) {

				if (isHTML5) {

					$('body').inject('inline-script', function() {

						var lowestQuality = $('.selectQuality option')[$('.selectQuality option').length - 1].value;

						$('.selectQuality').val(lowestQuality);

						$('.selectQuality').change();

					});

				}

			}

		});

		////////////////////////////////
		// Pauses Video on Tab Switch //
		////////////////////////////////

		chrome.storage.sync.get('enablePauseOnSwitch', function(items) {
			if (items.enablePauseOnSwitch == true) {
				var hidden;
				var vis;
				if (typeof document.webkitHidden !== 'undefined') {hidden = 'webkitHidden'; vis = 'webkitvisibilitychange';}
				function setPlay() {
					$('head').inject('inline-script', function jwplay() {
						jwplayer('divContentVideo').play(true);
					}, true);
				}
				function visChange() {
					if (document[hidden]) {
						if (isHTML5) document.getElementById('my_video_1_html5_api').pause(); // HTML5 Player
					}
				}
				document.addEventListener(vis, visChange, false);
			}
		});

		////////////////////////////////////////////
		// Stretch video to fill screen/container //
		////////////////////////////////////////////

		chrome.storage.sync.get(['enableStretchFullscreenVid', 'enableAutoFullscreen'], function(items) {
			if (items.enableStretchFullscreenVid == true) {
				if (items.enableAutoFullscreen == true) {
					$('#my_video_1_html5_api').css('object-fit', 'fill');
				} else {
					$(document).on('webkitfullscreenchange', function() {
						if (document.webkitIsFullScreen == true) $('#my_video_1_html5_api').css('object-fit', 'fill');
						else $('#my_video_1_html5_api').css('object-fit', '');
					});
				}
			}
		});

		//////////////////////
		// Fullscreen Video //
		//////////////////////

		chrome.storage.sync.get('enableAutoFullscreen', function(items) {

			if (items.enableAutoFullscreen == true) {

				// $('#adsIfrme11').next().remove();
				// $('#adsIfrme11').remove(); // Ad is going to be behind the video so no point in keeping it in the case the user is not blocking ads

				$('head').inject('css', chrome.runtime.getURL('assets/css/autoFullscreen.css'));

				// HTML5 Player //
				if (isHTML5) {

					$(document).on('click', '#scrollToVideo', function() {
						$('#my_video_1').scrollView();
					});

					$('#my_video_1_html5_api').on('playing', function() {
						$('#my_video_1').scrollView();
					});

					$('head').inject('inline-script', function() {
						window.myPlayer.ready(function () {
							this.off('dblclick');
						});
					});

					setTimeout(() => $('#my_video_1').scrollView(), 1000);

					$('.vjs-fullscreen-control').hide();
					$('.vjs-volume-control').css('margin-right', '10px');

				// The other iFrame Players that I can't touch //
				} else if (isIFrame) {

					var videoiFrame = $('#divContentVideo iframe');

					$(document).on('click', '#scrollToVideo', function() {
						videoiFrame.scrollView();
					});

					videoiFrame.scrollView();

				}

				$('#centerDivVideo').after('<div style="margin-top:10px"><a id="scrollToVideo" href="javascript:void(0)">(Scroll to Video)</a></div>');

				$('#centerDivVideo').css('z-index', '9999');

			}
		});

		//////////////////
		// Theater Mode //
		//////////////////

		chrome.storage.sync.get({
			enableTheaterMode: false,
			enableTheaterBacklight: false
		}, function(items) {

			if (items.enableTheaterMode === true) {

				$('#divFloatRight').remove(); // Please let this one pass. If its not removed it will be under the player and not look right.

				$('head').inject('css', chrome.runtime.getURL('assets/css/theaterMode.css'));

				if (isHTML5) {

					var video = $('#my_video_1_html5_api');

					if (items.enableTheaterBacklight === true) {

						$('.bigBarContainer').prepend('<canvas id="backgroud-canvas"></canvas>');

						var canvas = $('#backgroud-canvas')[0];
						var context = canvas.getContext('2d');
						var width = canvas.width = canvas.clientWidth;
						var height = canvas.height = canvas.clientHeight;

						function loop() {
							if (video[0].paused || video[0].ended) return;
							context.drawImage(video[0], 0, 0, width, height);
							setTimeout(loop, 20);
						}

						video.on('playing', function() {
							$('#backgroud-canvas').fadeIn(400);
							$('body').css('overflow', 'hidden');
							loop();
						});

						video.on('pause', function() {
							$('body').css('overflow', 'initial');
							$('#backgroud-canvas').fadeOut(400);
						});

					} else {

						$('#switch').hide();

						$('.bigBarContainer').append('<div id="background-dim"></div>');

						video.on('pause', function() {

							$('#background-dim').fadeOut(400);

						});

					}

					video.on('playing', function() {

						centerElement(video);

						if (!items.enableTheaterBacklight)
							$('#background-dim').fadeIn(400);


					});

					$(window).resize(function() {
						centerElement(video);
					});

				} else {

					$('#selectEpisodeContainer').scrollView();

				}

			}

		});

		/////////////////////////////////
		// ALternate Video Page Layout //
		/////////////////////////////////

		chrome.storage.sync.get([
			'enableAltVideoPage',
			'enableAds',
			'enableVideoPageAds',
			'altVideoPageWidth',
			'enableSlimHeader'
		], function(items) {

			return;

			if (items.enableAltVideoPage == true) {

				$('#container').prepend(`
					<div id="videoContainer"></div>
					<div id="otherStuff"></div>
					<div id="importantStuff"></div>
					<div class="clear"></div>
				`);

				/* Moving Stuff */
				$('#switch').detach().appendTo('#playerSwitchLightsOffContainer'); // Moves the Lights Off Switch in the playerSwitchLightsOffContainer element
				$('#centerDivVideo').detach().appendTo('#videoContainer'); // Moves the player container into a new container #videoContainer
				$('#selectEpisodeContainer, #playerSwitchLightsOffContainer, #divDownload, #divFileName, #redditThreadContainer').detach().appendTo('#otherStuff'); // Moves all the non player stuff into a new container #otherStuff
				$('#btnShowComments').parent().detach().appendTo('#otherStuff'); // Moves Comment button into #otherStuff
				$('#divComments').detach().appendTo('#otherStuff'); // Moves Comment container into #otherStuff

				/* Moves adsIfrme10 to another element temporarily so bigBarContainer can be removed without triggering the anti-Ad Blocker */
				$('#adsIfrme10').detach().appendTo('#importantStuff');
				setTimeout(function() {$('#adsIfrme10').remove();},5000);
				$('.bigBarContainer').remove();

				/* Removes useless stuff */
				$('a:contains("[ Back to top ]")').remove();
				$('#containerRoot .clear').slice(-3).remove();

				/* Inserts CSS file into head tag */
				$('head').inject('css', chrome.runtime.getURL('assets/css/rearrangeVideoPage.css'));

				/* Fix for Slimmer Header option */
				if (items.enableSlimHeader == true) $('#head + div').css('margin-bottom', '-127px');

				/* Sets custom video width */
				if (items.altVideoPageWidth) $('head').append(`<style>#videoContainer {width: ${items.altVideoPageWidth[0]}%}#otherStuff {width: ${items.altVideoPageWidth[1]}%}</style>`);
				// if (items.altVideoPageWidth) $('head').append('<style>#videoContainer {width: '+items.altVideoPageWidth[0]+'%} #otherStuff {width: '+items.altVideoPageWidth[1]+'%}</style>');

				/*  */
				setTimeout(function() {

					if (isHTML5) {

						var video_width = $('#my_video_1').width();

						var video_height = video_width / 1.767;

						// $('#my_video_1').style('height', video_height + 'px', 'important');
						$('#my_video_1').css('height', video_height);

						/* Autoplays the video after moving the player if the autoplay attr is set */
						if (document.getElementById('my_video_1_html5_api').hasAttribute('autoplay') == true) $('#my_video_1_html5_api').get(0).play();

						/* Layout messes up since window resize is triggered before the video is completely out of fullscreen. This will trigger the $(window).resize() again 100ms after the video is out of fullscreen. */
						$(document).on('webkitfullscreenchange', function() {
							if (!document.webkitIsFullScreen) setTimeout(function() { $(window).trigger('resize'); }, 100);
						});

					}

					/* Required for the comments box to resize correctly */
					$('#head').append('<div style="clear:both"></div>');

					/* Sets the height of the comment box */
					var content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ( $('#otherStuff').height() - $('#btnShowComments').parent().height() ) - 25;

					$('#divComments').height(content_height + 'px');

					/* Fix for Comment Profile Pictures not loading when scrolling down */
					$('#divComments > div, #disqus_thread').height((content_height + 1) + 'px');

				}, 100);

				$(window).resize(function() {

					console.log('Window Resized');

					if (isHTML5) {

						var video_width = $('#my_video_1').width();
						var video_height = video_width / 1.775;
						$('#my_video_1').css('height', video_height);

					} else if (isIFrame) {

						var video_width = $('#divContentVideo iframe').width();
						var video_height = video_width / 1.775;
						$('#divContentVideo iframe').height(video_height + 'px');

					} else if ($('#divContentVideo_wrapper').length) {

						var video_width = $('#divContentVideo_wrapper').width();
						var video_height = video_width / 1.775;
						$('#divContentVideo_wrapper').height(video_height + 'px');

					}

					var content_height;

					$('#divComments').height(0);

					if ( $('#divComments').is(':visible') ) {
						content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ($('#otherStuff').height() - $('#divComments').height()) - 10;
					}
					else {
						content_height = $(document).height() - $('#head').height() - $('#headnav').outerHeight(true) - ($('#otherStuff').height() - $('#btnShowComments').parent().height()) - 10;
					}
					$('#divComments').height(content_height + 'px');
					$('#divComments > div, #disqus_thread').css('height', (content_height + 1) + 'px');

					$('#videoContainer').resizable('option', 'maxWidth', ($(window).width() * 64) / 100);

				});

				$('#videoContainer').resizable({
					handles: 'e',
					minWidth: 560,
					maxWidth: ( $(window).width() * 64 ) / 100,
					resize: function(event, ui) {
						$('#otherStuff').width( 100 - ( $('#videoContainer').width() / $(window).width() ) * 100 - 2 + '%');
						$(ui.element).width( ($(ui.element).width() / $(window).width()) * 100 + '%' );
					},
					stop: function() {
						var videoWidth = ($('#videoContainer').width() / $(window).width()) * 100;
						var otherWidth = 100 - videoWidth - 2;
						chrome.storage.sync.set({altVideoPageWidth: [videoWidth, otherWidth]});
					}
				});

			}
		});

		///////////////////////////////////////////////////////
		// Remember Position for last video / time parameter //
		///////////////////////////////////////////////////////

		chrome.storage.sync.get('lastVideo', function(items) {

			if (!isHTML5) return;

			var currentPath = window.location.pathname + window.location.search.replace(/(\?|&)(?!id)([^=]+)=([^&]+)/gi, '') + window.location.hash;

			if (items.lastVideo) {

				if (currentPath === items.lastVideo.path)
					$('#my_video_1_html5_api').one('canplay', function() {
						this.currentTime = items.lastVideo.time;
					});

			}

			$(window).on('beforeunload', function() {

				if (
					document.getElementById('my_video_1_html5_api').duration - 40 < document.getElementById('my_video_1_html5_api').currentTime
					|| document.getElementById('my_video_1_html5_api').ended == true
				) {

					chrome.storage.sync.remove('lastVideo');

				} else if (document.getElementById('my_video_1_html5_api').ended == false) {

					var currentTime = document.getElementById('my_video_1_html5_api').currentTime;

					chrome.storage.sync.set({
						lastVideo: {
							title: AnimeTitle,
							episode: currentEpisode,
							path: currentPath,
							time: currentTime
						}
					});

				}

			});

			if (getUrlParameter('time')) {
				var time = getUrlParameter('time');
				if (isHTML5) {
					$('#my_video_1_html5_api').one('canplay', function() {
						this.currentTime = time;
					});
				}
				history.pushState('', document.title, window.location.href.replace(/&?time=([^&]$|[^&]*)/i, ''));
			}

		});

		/////////////////////
		// Remember Volume //
		/////////////////////

		chrome.storage.sync.get('volume', function(items) {

			if (isHTML5) {

				if (items.volume) {

					document.getElementById('my_video_1_html5_api').volume = items.volume;

					$(window).on('beforeunload', function() {
						var volume = document.getElementById('my_video_1_html5_api').volume;
						chrome.storage.sync.set({ volume });
					});

				} else {

					$(window).on('beforeunload', function() {
						var volume = document.getElementById('my_video_1_html5_api').volume;
						chrome.storage.sync.set({ volume });
					});

				}

			}

		});

		///////////////////////////////
		// Adjust volume with scroll //
		///////////////////////////////

		$('#my_video_1_html5_api').on('mousewheel', function (event) {

			if (this.paused) return;

			let volume = this.volume;

			let newVolume = event.originalEvent.deltaY > 0
				? volume - 0.05
				: volume + 0.05;

			newVolume = newVolume.toFixed(2);

			if (newVolume < 0)
				newVolume = 0;
			else if (newVolume > 1)
				newVolume = 1;

			this.volume = newVolume;

			event.preventDefault();

		});

		///////////////////////
		// MyAnimeList Stuff //
		///////////////////////

		chrome.storage.local.get(['enableMALAPI', 'MALLoggedIn'], function(items) {

			if (items.enableMALAPI === true && items.MALLoggedIn === true) {

				toastr.options.positionClass = 'toast-top-center';
				toastr.options.timeOut = '0';
				toastr.options.extendedTimeOut = '0';
				toastr.options.preventDuplicates = false;
				toastr.options.target = '#my_video_1';
				var updateOptions = {timeOut: 10000, extendedTimeOut: 10000};

				var current = parseFloat(currentEpisode.split('Episode ', 3)[1]);
				var isEpisode = currentEpisode.indexOf('Episode') > -1;

				if (isEpisode && Number.isInteger(current)) {

					$.ajax({
						url: currentAnimeURL,
						success: function(data) {

							var AnimeTitle = $(data).find('.barContent > div > a.bigChar').text().replace('(Sub)', '').replace('(Dub)', '').trim();
							var AnimeTitles = [];

							$(data).find('span:contains("Other name:")').parent().find('a').each(function(index, entry) {
								AnimeTitles.push(entry.textContent);
							});

							AnimeTitles.unshift(AnimeTitle);

							chrome.runtime.sendMessage({
								MALv2: {
									type: 1,
									titles: AnimeTitles,
									path: window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
								}
							}, function(response) {

								console.log(response);

								if (!response.success && response.error === 429) toastr.error(response.data, 'MyAnimelist Integration', { timeOut: '15000', extendedTimeOut: '15000', positionClass: 'toast-top-right' });

								if (!response.success && response.error === 404) return;

								if (response.success) {

									var id = parseInt(response.data.mal.id);
									var inUserMAL = response.data.user ? true : false;
									var hasUpdated;

									console.log(inUserMAL);

									if (inUserMAL) {

										$('#navsubbar p').append(`
											| <span id="findinMALContainer" class="KEPad"></span>
											| <span style="padding: 0px 7px">
												<span>Episodes Watched:</span>
												<input type="number" id="episodesUserCurrentText" class="KETextInput" style="border: 1px solid white;" value="0" min="0">
												<span>/</span>
												<input type="text" id="episodesTotalText" class="KETextInput" disabled>
											</span>
											| <span style="padding: 0px 7px">
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
											</span>
										`);

										$('#findinMALContainer').append(`<a href="https://myanimelist.net/anime/${id}" target="_blank">MAL Link</a>`);

										console.log(response);

										$('#episodesUserCurrentText').val(response.data.user.data.my_watched_episodes); // Adds the value for the Current Episode
										if (parseInt(response.data.user.data.series_episodes) !== 0) $('#episodesUserCurrentText').attr('max', response.data.user.data.series_episodes);
										$('#episodesTotalText').val(response.data.user.data.series_episodes); // Adds the value for the Total Episodes
										$('#scoreDropdown').val(response.data.user.data.my_score);

										var currentEpisodeValue;

										$('#episodesUserCurrentText').on('focus', function() {
											currentEpiValue = this.value;
											$(this).animate({'width': '40px'});
										});

										/* == Update Episode == */
										$('#episodesUserCurrentText').on('blur', function() {

											$(this).animate({'width': '25px'});

											if (currentEpisodeValue != this.value) {

												chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: this.value } }, function(response) {

													console.log('Episode Status:', response);

													if (response.success) {
														toastr['success']('Episode Updated!', '', updateOptions);
														hasUpdated = true;
													} else toastr['error'](response.data);

												});

											}

										});

										/* == User's MAL Score Dropdown == */
										$('#scoreDropdown').on('change', function() {

											chrome.runtime.sendMessage({ MALv2: { type: 6, id: id, score: this.value } }, function(response) {

												console.log('Score Status:', response);

												if (response.success) toastr['success']('Score successfully updated!', '', updateOptions);
												else toastr['error']('An error has occured!', '', updateOptions);

											});

										});

										var watchedEpisodes = parseInt(response.data.user.data.my_watched_episodes);

										if (parseInt(response.data.user.data.my_status) !== 2 && watchedEpisodes < current && current <= $('#selectEpisode option').length) {

											$('#navsubbar p').append('<span id="countDownContainer">| <span style="padding: 0px 7px">Time until update: <span id="countDown">N/A</span></span></span>');

											hasUpdated = false;
											var offset;

											if (isHTML5) {

												var player = document.getElementById('my_video_1_html5_api');

												if (player.duration < 300) offset = 60;
												else offset = 180;

												var countDown = setInterval(function() {

													var countDownSeconds = Math.floor(player.duration - player.currentTime - offset);
													countDownSeconds--;

													if (countDownSeconds < 0) {
														clearInterval(countDown);
														doConfirmation();
														$('#countDownContainer').remove();
													} else {
														$('#countDown').text(getTime(countDownSeconds));
													}

												}, 200);

												$('#my_video_1_html5_api').unbind('ended').on('ended', function() {

													storage.sync.get('enableAutoAdvEp', function(items) {

														toastr.remove();

														if (items.enableAutoAdvEp === true && $('#selectEpisode option:selected').next().length) {
															toastr.options.timeOut = '15000';
															toastr.options.extendedTimeOut = '15000';
															toastr.options.onHidden = function() { $('#btnNext').click(); };
														}

														doConfirmation(items.enableAutoAdvEp);

														clearInterval(countDown);

														$('#countDownContainer').remove();

													});

												});

											}

											function doConfirmation(enableAutoAdvEp) {

												//clearInterval(updateInterval);

												if (hasUpdated == false) {

													toastr['info'](`<div style="margin-bottom:5px">Update episode number from ${watchedEpisodes} to ${current}?</div><button type="button" class="updateEpisode btn">Update</button>&nbsp;<button type="button" class="cancelUpdate btn">Cancel</button>`, 'Update MyAnimeList?');

													$('.updateEpisode').click(function() {

														chrome.runtime.sendMessage({ MALv2: { type: 4, id: id, episode: current } }, function(response) {

															console.log('Episode Status:', response);

															if (response.success) {
																hasUpdated = true;
																toastr['success']('Episode Updated!', '', updateOptions);
																$('#episodesUserCurrentText').val(current);
															} else toastr['error'](response.data);

														});

													});

												} else {

													if (enableAutoAdvEp === true) $('#btnNext').click();

												}

											}

											function getTime(seconds) {
												var a = Math.floor(seconds / 60);
												var b = Math.floor(seconds % 60);
												if (b < 10) b = '0' + b;
												return a+':'+b;
											}

										}

									}

								}

							});

						}
					});

				}

			}

		});

		////////////////
		// ScrollView //
		////////////////

		$.fn.scrollView = function(offset) {
			var top;
			return this.each(function() {
				if (offset) top = $(this).offset().top + offset;
				else top = $(this).offset().top;
				$('html, body').stop().animate({
					scrollTop: top
				}, 1000);
			});
		};

		$.fn.center = function() {
			var elHeight = $(this).height();
			var elOffset = $(this).offset().top;
			var windowHeight = $(window).height();
			var offset = elOffset - (windowHeight - elHeight) / 2;
			$('html, body').scrollView(offset);
		};

		function centerElement(el) {
			var elHeight = $(el).height();
			var elOffset = $(el).offset().top;
			var windowHeight = $(window).height();
			var offset = elOffset - (windowHeight - elHeight) / 2;
			$('html, body').scrollView(offset);
		}

		///////////////////////////
		// Scrolls down to video //
		///////////////////////////

		chrome.storage.sync.get({
			enableAutoFullscreen: false,
			enableAltVideoPage: false,
			enableTheaterMode: false
		}, function(items) {
			if (!items.enableAutoFullscreen || !items.enableAltVideoPage || !item.enableTheaterMode) {
				centerElement('#centerDivVideo');
			}
		});

		// Disables the YouTube Player's built in Keyboard Shortcuts //
		$('#embedVideo').attr('src', $('#embedVideo').attr('src') + '&disablekb=1');

		////////////////////////
		// Keyboard Shortcuts //
		///////////////////////////////////////////////////////
		// Used Mousetrap from https://craig.is/killing/mice //
		///////////////////////////////////////////////////////

		// Used to set Status Text. //
		var statusTimeout;
		function setStatusText(text, clear, timeout) {
			if (timeout == true) clearTimeout(statusTimeout);
			$('#status').html(text);
			$('#status').fadeIn(250, function() {
				if (clear) statusTimeout = setTimeout(function() {
					$('#status').fadeOut(250, function() {
						$('#status').html('');
					});
				}, clear);
			});
		}

		/////////////////////////////////
		// Creates Status Text Element //
		/////////////////////////////////

		setTimeout(function() {

			if (isHTML5)
				$('#my_video_1').prepend('<div id="status"></div>');
			else if
			($('#divContentVideo_wrapper').length) $('#divContentVideo_wrapper').prepend('<div id="status"></div>');

			$('#status').css({
				'display': 'none',
				'position': 'absolute',
				'top': '5px',
				'font-size': '23px',
				'z-index': '1',
				'color': 'white',
				'left': '7px',
				'text-shadow': '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0px 1px 0 #000,1px 0px 0 #000,0px -1px 0 #000,-1px 0px 0 #000',
				'background': 'rgba(0,0,0,0.4)',
				'letting-spacing': '1px',
				'box-shadow': '0 0 15px 10px rgba(0,0,0,0.4)',
				'font-family': 'monospace',
				'pointer-events': 'none'
			});

		}, 1000);

		if ($('#centerDivVideo').length) {

			chrome.storage.sync.get(function(items) {

				if (items.enableKeyboardShortcuts == true) {

					var efka = {}; // Namespace for shortcut functions //

					// Unbinds the default HTML5 shortcuts since I want the extension to handle all shortcuts.
					$('body').inject('inline-script', function() {
						videojs('my_video_1').ready(function() {
							this.off('keydown');
						});
					});

					 // Default Shortcuts if no custom shortcut is set //
					var KeyboardShortcuts = {
						'Open': ['h', '/'],
						'Fullscreen': 'f',
						'Lights': 'l',
						'PlayPause': 'p',
						'VolUp': 'up',
						'VolDown': 'down',
						'SeekForward': 'right',
						'SeekBack': 'left',
						'Previous': 'b',
						'Next': 'n',
						'Comments': 'c',
						'Reload': 'r',
						'Information': 'i',
						'Skip': 's',
						'Advance': 'a',
						'PlaybackRateUp': ['=', '+'],
						'PlaybackRateDown': '-',
						/*
						Default Shortcuts Reference. When unbinding a key, the shortcut will
						revert to the default shortcut.
						*/
						'DEFAULTS': {
							'Open': ['h', '/'],
							'Fullscreen': 'f',
							'Lights': 'l',
							'PlayPause': 'p',
							'VolUp': 'up',
							'VolDown': 'down',
							'SeekForward': 'right',
							'SeekBack': 'left',
							'Previous': 'b',
							'Next': 'n',
							'Comments': 'c',
							'Reload': 'r',
							'Information': 'i',
							'Skip': 's',
							'Advance': 'a',
							'PlaybackRateUp': ['=', '+'],
							'PlaybackRateDown': '-'
						}
					};

					// Overwrites the default shortcuts with the ones in chrome.storage. //
					if (items.keyboardShortcuts) {
						$.each(items.keyboardShortcuts, function(index, value) {
							KeyboardShortcuts[index] = value;
						});
					}

					if ($('#my_video_1_html5_api').length) {
						$('.ccmVJSControls').after('<div class="option ccmHideStatus">Hide KS Status Text</div>');
						$('.ccmHideStatus').click(function() {
							if ($(this).hasClass('active')) {
								$(this).removeClass('active');
								$('#statusHide').remove();
							} else {
								$(this).addClass('active');
								$('head').append('<style id="statusHide">#status {display:none !important}</style>');
							}
						});
					}

					/////////////////////
					// Help Dialog Box //
					/////////////////////
					var KeyboardShortcutsHTML = chrome.runtime.getURL('/InjectedHTML/KeyboardShortcuts.html');
					$('#containerRoot').prepend('<div id="KBSHelpHTML"></div>');
					$('#KBSHelpHTML').load(KeyboardShortcutsHTML, function() {

						$('.shortcutText').each(function(index, value) {
							$(value).text( (KeyboardShortcuts[$(value).attr('data-shortcut')]).toUpperCase() );
						}).click(function(e) {
							var _this = $(this);
							var shortcut = $(this).attr('data-shortcut');
							_this.css('color', 'yellow');

							Mousetrap.record(function(a) {

								console.log(a);

								if ( checkKeys(KeyboardShortcuts, a[0]) == 1 ) {

									toastr['error']('Shortcut already binded!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 2 ) {

									toastr['error']('This key is reserved!<br>Cannot bind shortcut to this key!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 3 ) {

									toastr['info']('Cleared Shortcut!<br>Reverted to default.', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									Mousetrap.unbind(KeyboardShortcuts[shortcut]);
									chrome.storage.sync.get('keyboardShortcuts', function(items) {
										if (items.keyboardShortcuts) {
											delete items.keyboardShortcuts[shortcut];
											chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
										}
									});
									KeyboardShortcuts[shortcut] = KeyboardShortcuts.DEFAULTS[shortcut];
									Mousetrap.bind(KeyboardShortcuts[shortcut], efka['do_'+shortcut+'_Shortcut']);
									_this.text( KeyboardShortcuts[shortcut].toUpperCase() ).css( 'color', 'white' );

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 4 ) {

									toastr['info']('Canceled Key Recording!', '', {timeOut: 3000, extendedTimeOut: 3000, preventDuplicates: true});
									_this.css('color', 'white');

								} else if ( checkKeys(KeyboardShortcuts, a[0]) == 5 ) {
									toastr['error']('Function Keys cannot be binded!', '', {timeOut: 5000, extendedTimeOut: 5000, preventDuplicates: true});
									_this.css('color', 'white');

								} else {
									if ( a[0] != undefined ) {
										console.log(a[0]);
										_this.text( a[0].toUpperCase() ).css('color', 'white');
										Mousetrap.unbind(KeyboardShortcuts[shortcut]); // Unbinds the previous Key
										chrome.storage.sync.get('keyboardShortcuts', function(items) {
											if (!items.keyboardShortcuts) {
												var newCustShortcuts = {};
												newCustShortcuts[shortcut] = a[0];
												chrome.storage.sync.set({keyboardShortcuts: newCustShortcuts});
											} else {
												if (a[0] == KeyboardShortcuts.DEFAULTS[shortcut]) {
													delete items.keyboardShortcuts[shortcut];
													chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
												} else {
													items.keyboardShortcuts[shortcut] = a[0];
													chrome.storage.sync.set({keyboardShortcuts: items.keyboardShortcuts});
												}
											}
										});

										KeyboardShortcuts[shortcut] = a[0]; // Saves the new Key in Keyboard Shortcuts Object
										Mousetrap.bind(KeyboardShortcuts[shortcut], efka['do_'+shortcut+'_Shortcut']);
									} else {
										_this.css('color', 'white');
									}

								}

							});

							event.preventDefault();
						});

						/*
						undefined = Key not binded
						1 = Key already binded
						2 = Key is reserved
						3 = Backspace
						4 = Escape
						5 = Function Key
						Note: For now keys '-', '=', and '+' will not be allowed to use. This will most likely change
						later once I add the option to rebind the 'Playback Rate Up' and 'Playback Rate Down' shortcuts.
						*/

						function checkKeys(a, b) {
							for (var k in a) {
								if (!a.hasOwnProperty(k)) continue;
								if (Array.isArray(a[k])) {
									for (var i = 0; i < a[k].length; i++) {
										if (b === 'h' || b === '/' || b == '-' || b == '=' || b == '+' || b == 'space') return 2;
										else if (a[k][i] === 'backspace') return 3;
										else if (a[k][i] === 'esc') return 4;
										else if ( /[F]\d/g.test(a[k][i]) ) return 5;
										else if (a[k][i] === b) return 1;
									}
								} else {
									if (b === 'h' || b === '/' || b == '-' || b == '=' || b == '+' || b == 'space') return 2;
									else if (b === 'backspace') return 3;
									else if (b === 'esc') return 4;
									else if ( /[f]\d/g.test(b) ) return 5;
									else if ( a[k] === b ) return 1;
								}
							}
						}

						function checkConflicts(a, b) {
							var conflicts = [], noconflicts = [];
							for (var k in a) {
								if ( a.hasOwnProperty(k) ) {
									if (a[k] == b) conflicts.push(k);
									else noconflicts.push(k);
								}
							}
							if (conflicts.length > 1) return { conflicts, noconflicts };
							return { noconflicts };
						}

						chrome.storage.sync.get('keyshortcuts_help', function(items) {
							document.getElementById('keyshortcuts_help').checked = items.keyshortcuts_help;
						});

						Mousetrap.bind(KeyboardShortcuts['Open'], function() {
							console.debug(KeyboardShortcuts);
							$('#help_box').dialog({
								appendTo: '#container', show: {effect: 'blind', duration: 300}, hide: {effect: 'blind', duration: 300}, width: '550', resizable: false, position: { my: 'center', at: 'center', of: window },
								close: function() {
									Mousetrap.stopRecord();
									Mousetrap.bind(KeyboardShortcuts['Open'], function() {
										$('#help_box').dialog('open');
										console.debug(KeyboardShortcuts);
									});
								},
								open: function() {
									Mousetrap.bind(KeyboardShortcuts['Open'], function() {
										$('#help_box').dialog('close');
									});
								},
							});
							$('.ui-button-text').hide();
						});

						$(document).on('click', '#keyshortcuts_help', function() {
							var keyshortcuts_help = document.getElementById('keyshortcuts_help').checked;
							chrome.storage.sync.set({keyshortcuts_help:keyshortcuts_help});
						});

						// Sets the inputmask //
						$('#skipTimeInput').inputmask('99:99');

						// Sets the default SkipTime to 1 minute and 25 seconds //
						chrome.storage.sync.get('skipTime', function(items) {
							if (!items.skipTime) {
								chrome.storage.sync.set({skipTime: '01:25'});
								$('#skipTimeInput').val('01:25');
								console.log('Default Skip Time Set');
							} else {
								$('#skipTimeInput').val(items.skipTime);
							}
						});

						// Saves new SkipTime //
						$('#saveSkipTime').click(function() {
							var saveTime = $('#skipTimeInput').val();
							chrome.storage.sync.set({skipTime: saveTime});
							toastr['success']('Skip Time Saved!');
						});

						// Sets the inputmask //
						$('#advTimeInput').inputmask('99:99');

						// Sets the default AdvanceTime to 30 seconds //
						chrome.storage.sync.get('advanceTime', function(items) {
							if (!items.advanceTime) {
								chrome.storage.sync.set({advanceTime: '00:30'});
								$('#advTimeInput').val('00:30');
								console.log('Default Advance Time Set');
							} else {
								$('#advTimeInput').val(items.advanceTime);
							}
						});

						// Saves new SkipTime //
						$('#saveadvTime').click(function() {
							// Checks to see if time is Valid before saving //
							var saveTime = $('#advTimeInput').val();
							chrome.storage.sync.set({advanceTime: saveTime});
							toastr['success']('Advance Time Saved!');

						});

					});

					// Timeout is so the JWPLAYER can load for videos that still use it //
					setTimeout(function() {

						if ($('#divContentVideo_wrapper').length) {
							setStatusText('Keyboard Shortcuts is not supported with the JWPlayer. Please switch to the HTML5 player if you wish to use Keyboard Shortcuts.', 5000);
						}

						chrome.storage.sync.get('keyshortcuts_help', function(items) {
							if (items.keyshortcuts_help == false || items.keyshortcuts_help == null) {
								if (!$('#divContentVideo_wrapper').length) {
									setStatusText(`Keyboard Shortcuts Enabled. Press ${KeyboardShortcuts['Open'].map((x) => x.toUpperCase()).join(' or ')} on the Keyboard for a list of Shortcuts.`, 5000);
								}
							}
						});

						///////////////////////////
						// All Players Shortcuts //
						///////////////////////////

						////////////////
						// Lights Off //
						////////////////

						efka['do_Lights_Shortcut'] = function() {
							if ($('#lightsofflayer').length == 0) {
								$('body').append('<div id="lightsofflayer" style="height:100%;width:100%;background-color:black;opacity: 0.9;;z-index:11;position:fixed;top:0px;display:none;"></div>');
								$('#lightsofflayer').fadeToggle();
								$('#centerDivVideo').css('z-index','12');
								$('#lightsofflayer').click(function() {
									$('#lightsofflayer').fadeToggle(function() {
										$('#lightsofflayer').remove();
									});
								});
							} else if ($('#lightsofflayer').length != 0) {
								$('#lightsofflayer').fadeToggle(function() {
									$('#lightsofflayer').remove();
								});
							}
						};

						Mousetrap.bind(KeyboardShortcuts['Lights'], efka.do_Lights_Shortcut);

						/////////////////////
						// Comment Section //
						/////////////////////

						efka['do_Comments_Shortcut'] = function() {
							if ($('iframe[title="Disqus"]').length == 0) {
								var disqus_shortname = 'kissanime';
								(function () {
									var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
									dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
									(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
								})();
								$('#divComments').show();
								$('#btnShowComments').parent().fadeToggle();
								setTimeout(function() {
									$('#divComments').scrollView();
								}, 1000);
							} else if ($('#divComments').is(':hidden')) {
								$('#divComments').slideToggle(1000);
								$('#btnShowComments').parent().fadeToggle();
								setTimeout(function() {$('#divComments').scrollView();}, 700);
							} else if ($('#divComments').is(':visible')) {
								$('#divComments').slideToggle(1000);
								setTimeout(function() {
									$('#btnShowComments').parent().fadeToggle();
								}, 1000);
								chrome.storage.sync.get('enableAutoFullscreen', function(items) {
									if (items.enableAutoFullscreen) $('#my_video_1').scrollView();
									else $('.barContent').scrollView();

								});
							}
						};

						Mousetrap.bind(KeyboardShortcuts['Comments'], efka.do_Comments_Shortcut);

						///////////////////////////
						// Display Episode Info //
						//////////////////////////

						// https://stackoverflow.com/questions/5612787/converting-an-object-to-a-string#answer-5612876 //
						// Slightly changed //
						function objToString (obj) {
							var str = '';
							for (var p in obj) {
								if (obj.hasOwnProperty(p)) {
									str += p + ': ' + obj[p] + '<div style="height:5px"></div>';
								}
							}
							return str;
						}

						efka['do_Information_Shorcut'] = function() {
							var info = {};
							info['Currently Playing'] = AnimeTitle+' '+currentEpisode;
							info['Video Host'] = window.videohost;
							if ($('#my_video_1_html5_api').length) {
								var video = $('#my_video_1_html5_api')[0];
								var networkState = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
								info['Player Dimensions'] = $('#my_video_1').width()+'x'+$('#my_video_1').height();
								info['Quality'] = $('.selectQuality option:selected').text();
								info['Volume'] = (video.volume * 100).toFixed(2) + '%';
								info['Playback Rate'] = video.playbackRate + 'x';
								info['Network State'] = networkState[video.networkState];
								info['Buffered'] = video.buffered.end(video.buffered.length-1) + '/' + video.duration;
							} else if ($('#embedVideo').length) {
								var video = $('#embedVideo')[0];
								info['Player Dimensions'] = $('#embedVideo').width()+'x'+$('#embedVideo').height();
								info['Quality'] = video.getPlaybackQuality();
								info['Volume'] = video.getVolume();
							}
							if ($('html')[0].hasAttribute('data-existinusermal') == true) {
								info['Exists In User\'s MAL'] = $('html').attr('data-existinusermal');
								info['MAL ID'] = $('html').attr('data-MALID');
							}
							setStatusText(`<div style="font-size:15px">${objToString(info)}</div>`, 6000, true);
						};

						Mousetrap.bind(KeyboardShortcuts['Information'], efka.do_Information_Shorcut);

						//////////////////////
						// Previous Episode //
						//////////////////////

						efka['do_Previous_Shortcut'] = function() {
							$('#btnPrevious').click();
						};

						Mousetrap.bind(KeyboardShortcuts['Previous'], efka.do_Previous_Shortcut);

						//////////////////
						// Next Episode //
						//////////////////

						efka['do_Next_Shortcut'] = function() {
							$('#btnNext').click();
						};

						Mousetrap.bind(KeyboardShortcuts['Next'], efka.do_Next_Shortcut);

						////////////////////////////
						// HTML5 Player Shortcuts //
						////////////////////////////

						if ($('#my_video_1_html5_api').length) {

							console.log('%cEssentials for KissAnime: HTML5 Player is Active', 'color:blue');
							console.log('%cEssentials for KissAnime: Keyboard Shortcuts Enabled', 'color:blue');

							var video = document.getElementById('my_video_1_html5_api');
							var videoContainer = $('#my_video_1');

							////////////////
							// Fullscreen //
							////////////////

							efka['do_Fullscreen_Shortcut'] = function() {
								if (items.enableAutoFullscreen == false) {
									$('.vjs-fullscreen-control').click();
								}
							};

							Mousetrap.bind(KeyboardShortcuts['Fullscreen'], efka.do_Fullscreen_Shortcut);

							////////////////
							// Play/Pause //
							////////////////

							efka['do_PlayPause_Shortcut'] = function() {
								video.paused ? video.play() : video.pause();
							};

							Mousetrap.bind(KeyboardShortcuts['PlayPause'], efka.do_PlayPause_Shortcut);

							Mousetrap.bind('space', function() {
								if ( videoContainer.is(':focus') ) {
									video.paused ? video.play() : video.pause();
									event.preventDefault();
								}
							});

							video.addEventListener('pause', function() {
								setStatusText('Paused', 3000, true);
							});

							video.addEventListener('play', function() {
								setStatusText('Playing', 3000, true);
							});

							///////////////
							// Volume Up //
							///////////////

							efka['do_VolUp_Shortcut'] = function() {

								if (video.paused && video.volume >= 1) return;

								var newVolume = video.volume + 0.05;

								newVolume = newVolume.toFixed(2);

								if (newVolume > 1)
									newVolume = 1;

								video.volume = newVolume;

								event.preventDefault();

							};

							Mousetrap.bind(KeyboardShortcuts['VolUp'], efka.do_VolUp_Shortcut);

							/////////////////
							// Volume Down //
							/////////////////

							efka['do_VolDown_Shortcut'] = function() {

								if (video.paused && video.volume <= 0) return;

								var newVolume = video.volume - 0.05;

								newVolume = newVolume.toFixed(2);

								if (newVolume < 0)
									newVolume = 0;

								video.volume = newVolume;

								event.preventDefault();

							};

							Mousetrap.bind(KeyboardShortcuts['VolDown'], efka.do_VolDown_Shortcut);

							video.addEventListener('volumechange', function() {
								if (!video.muted) setStatusText(`Volume: ${Math.round(this.volume * 100)}`, 3000, true);
							});

							//////////////////
							// Seek Forward //
							//////////////////

							efka['do_SeekForward_Shortcut'] = function() {
								video.currentTime += 3;
							};

							Mousetrap.bind(KeyboardShortcuts['SeekForward'], efka.do_SeekForward_Shortcut);

							///////////////
							// Seek Back //
							///////////////

							efka['do_SeekBack_Shortcut'] = function() {
								video.currentTime -= 3;
							};

							Mousetrap.bind(KeyboardShortcuts['SeekBack'], efka.do_SeekBack_Shortcut);

							////////////////////////////////////////
							// Displays current time when seeking //
							////////////////////////////////////////

							video.addEventListener('seeking', function() {

								var currentTime = video.currentTime;
								var totalTime = video.duration;

								var currentMinutes = Math.floor(currentTime / 60);
								var currentSeconds = Math.floor(currentTime % 60);

								if (currentMinutes < 10) currentMinutes = '0' + currentMinutes;
								if (currentSeconds < 10) currentSeconds = '0' + currentSeconds;

								var totalMinutes = Math.floor(totalTime / 60);
								var totalSeconds = Math.floor(totalTime % 60);

								if (totalMinutes < 10) totalMinutes = '0' + totalMinutes;
								if (totalSeconds < 10) totalSeconds = '0' + totalSeconds;

								setStatusText(`${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`, 3000, true);

							});

							//////////////////
							// Reload Video //
							//////////////////

							efka['do_Reload_Shortcut'] = function() {
								var currentTime = video.currentTime;
								video.load();
								video.currentTime = currentTime;
							};

							Mousetrap.bind(KeyboardShortcuts['Reload'], efka.do_Reload_Shortcut);

							///////////////////////////////
							// Auto Skip to certain time //
							///////////////////////////////

							efka['do_Skip_Shortcut'] = function() {
								chrome.storage.sync.get('skipTime', function(items) {
									var storageTime = items.skipTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.currentTime = time;
								});
							};

							Mousetrap.bind(KeyboardShortcuts['Skip'], efka.do_Skip_Shortcut);

							////////////////////////////
							// Advance certain amount //
							////////////////////////////

							efka['do_Advance_Shortcut'] = function() {
								chrome.storage.sync.get('advanceTime', function(items) {
									var storageTime = items.advanceTime;
									var time = parseInt(storageTime.split(':')[0]) * 60 + parseInt(storageTime.split(':')[1]);
									video.currentTime = video.currentTime + time;

								});
							};

							Mousetrap.bind(KeyboardShortcuts['Advance'], efka.do_Advance_Shortcut);

							///////////////////
							// Playback Rate //
							///////////////////

							if (items.enablePlaybackRate == true) {

								efka['do_PlaybackRateUp_Shortcut'] = function() {
									$('#playbackRateSlider').slider('value', $('#playbackRateSlider').slider('value') + 0.05);
									setStatusText('Playback Rate: ' + $('#playbackRateSlider').slider('value') + 'x', 3000, true);
								};

								Mousetrap.bind(KeyboardShortcuts['PlaybackRateUp'], efka.do_PlaybackRateUp_Shortcut);

								efka['do_PlaybackRateDown_Shortcut'] = function() {
									$('#playbackRateSlider').slider('value', $('#playbackRateSlider').slider('value') - 0.05);
									setStatusText('Playback Rate: ' + $('#playbackRateSlider').slider('value') + 'x', 3000, true);
								};

								Mousetrap.bind(KeyboardShortcuts['PlaybackRateDown'], efka.do_PlaybackRateDown_Shortcut);

							}

						}

					}, 1500);
				}
			});
		}

	}

});
