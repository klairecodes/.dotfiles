// STILL NEEDS BE LOOKED OVER //

var storage = chrome.storage;

$(document).ready(function() {

	if ($('.cf-browser-verification').length) return;

	////////////////////////////////////////////////////////////
	// Loads JSON with info that should probably be displayed //
	////////////////////////////////////////////////////////////

	chrome.runtime.sendMessage({ request: 'https://ke.pilar.moe/api/v2/public' }, function(data) {

		if (!data.success) return;

		var data = data.data;

		$("#container").before('<div class="version-box"></div>');
		$(".version-box").after('<div class="external-alerts"></div>');

		/////////////////
		// Version Box //
		/////////////////

		var helpTooltip = `
			<style>strong{color:#d5f406;}</style>
			<div>
				<h1>Manually Updating your Extensions</h1>
				<ol style="font-size:16px">
					<li>Click on the following link <strong><a style="cursor:pointer" id="openExtPage">chrome://extensions</a></strong>.</li>
					<li>At the top of the extensions page, check <strong>Developer mode</strong>. This is next to the big Extensions text right at the top.</li>
					<li>Click <strong>Update extensions now</strong> under <strong>Developer mode</strong>.</li>
					<li>Optional: Uncheck <strong>Developer mode</strong> after updating extensions.</li>
				</ol>
			</div>
		`;

		$('.version-box').append(`
			<div class="version-box-content" style="display:none">
				<div class="version-box-title">Newer Version Available!</div>
				<div class="version-box-content-text">
					A newer version of <span style="color:orange">Essentials for KissAnime</span> is available.
					Installed Version: <a class="installed-version" href="https://ke.pilar.moe/changelog" target="_blank"></a>.
					Latest Version: <a class="latest-version" href="https://ke.pilar.moe/changelog" target="_blank"></a>.
					<div><span class="update-text"></span> For a full list of changes, visit the <a href="https://ke.pilar.moe/changelog#current" target="_blank">Changelog Page</a>.</div>
					<div>Please wait a few hours and the newest version will automatically be installed or you can manually update if you want the update immediately.</div>
					<a style="cursor:pointer" class="notice" title='${helpTooltip}'>How to Manually Update your Extensions</a>
				 </div>
			</div>
		`);

		$(document).on('click', '#openExtPage', function() {
			chrome.runtime.sendMessage({ open: "extPage" });
		});

		tooltip();

		storage.local.get('version', function(items) {

			var updateAvailable = (versionCompare(data.version, items.version) == 1 || versionCompare(data.version, items.version) == -1);

			console.group('%c KissEssentials Version Check ', logStyleSolo);
			console.log(`%c Installed Version %c ${items.version} `, logStyleBeginning, logStyleEnd);
			console.log(`%c Latest Version %c ${data.version} `, logStyleBeginning, logStyleEnd,);
			console.log(`%c Update Available %c ${updateAvailable} `, logStyleBeginning, logStyleEnd);
			console.groupEnd();

			if (versionCompare(data.version , items.version) == 1) {
				$('.version-box-content').show();
				$('.installed-version').text(items.version);
				$('.latest-version').text(data.version);
				$('.update-text').text(data.update_text);
			}

		});

		//////////////
		// News Box //
		//////////////

		$('.external-alerts').append(`
			<div class="alert-box alert-fill">
				<div class="alert-title" style="text-align:center">
					<span class="alert-title-text"></span>
					<a class="icon-remove" href="javascript:void(0)" data-type="fill"></a>
				</div>
				<div class="alert-content">
					<div class="alert-arrow" style="margin-left: 50%"></div>
					<div class="alert-text"></div>
				</div>
			</div>
			<div class="alert-box alert-small">
				<div class="alert-title">
					<span class="alert-title-text"></span>
					<a class="icon-remove" href="javascript:void(0)" data-type="small"></a>
				</div>
				<div class="alert-content">
					<div class="alert-arrow"></div>
					<div class="alert-text"></div>
				</div>
			</div>
		`);

		$('.external-alerts .alert-title .icon-remove').click(function() {
			$(this).parent().parent().hide();
			chrome.storage.local.get({ noticeState: {} }, (items) => {
				items.noticeState[this.dataset.type] = new Date().toISOString();
				chrome.storage.local.set({ noticeState: items.noticeState });
			});
		});

		var alerts = data.alerts;

		chrome.storage.local.get('noticeState', (items) => {

			var noticeState = items.noticeState || {};

			for (var key in alerts) {
	
				if (!['fill', 'small'].includes(key)) continue;

				var alertTimestamp = new Date(alerts[key].timestamp);

				if (noticeState[key] && new Date(noticeState[key]) > alertTimestamp) continue;

				if (alerts[key]) {
					$('.alert-' + key).show();
					$('.alert-' + key + ' .alert-title-text').text(alerts[key].title);
					$('.alert-' + key + ' .alert-text').html(alerts[key].contents);
				}
	
			}
	
		});

		//////////////////
		// Cycle Alerts //
		//////////////////

		if (data.alerts_cycle.length)
			$('<div id="cycleAlerts"></div>').html(data.alerts_cycle[[Math.floor(Math.random() * data.alerts_cycle.length)]]).prependTo('#leftside');

	});

	storage.sync.get(function(items) {

		/////////////////
		// Welcome Box //
		/////////////////

		if (items.enableWelcomeBox === true) {

			$('#rightside').prepend(`
				<div id="WelcomeBox" class="welcome-box">
					<div class="welcome-box-title">Welcome!</div>
					<div class="welcome-box-content">
						<div class="arrow-general"></div>
						<div class="welcome-box-text"></div>
						<div class="efka-clear"></div>
						<div class="external-content" style="display:none"></div>
					</div>
				</div>
			`);

			$('.external-content').load(chrome.runtime.getURL('InjectedHTML/WelcomeBox.html'), function() {

				var bullet = chrome.extension.getURL('images/assets/bullet.png');
				var star = chrome.extension.getURL('images/star.png');

				chrome.runtime.sendMessage({ request: 'https://ke.pilar.moe/api/v2/seasons' }, function(data) { // Doing this to avoid ad blocker filters

					if (data.success === true) {

						var {data, meta} = data.data;

						var current = 0;

						data.forEach(function(season, index) {
							$('#seasonSelect').append(`<option value="${index}">${season.display}</option>`);
							if (season.current === true) {
								current = index;
							}
						});


						var seasonsVue = new Vue({
							el: ".welcome-box",
							data: {
								season: data[current],
								bullet: bullet,
								star: star
							},
							updated: function() {
								$('.tooltip').remove();
								$$(".list-container a[title]").tooltip({ offset: [5, 0], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });
							}
						});

						$$(".list-container a[title]").tooltip({ offset: [5, 0], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });

						$('#seasonSelect').change(function() {
							/* == Weird hack I need to do so the tooltips will properly set == */
							seasonsVue.season = [];
							setTimeout(() => seasonsVue.season = data[this.value], 200);
						});

						$('#seasonSelect').val(current).change();

						setTimeout(() => $('.season-list').data('loaded', true), 500);

						$('.external-content').show();

					} else {

						$('.external-content').show().html(`<div style="text-align:center;color:orangered">Could not load Seasons List<br>Error: ${data.error.status} ${data.error.statusText}</div>`);

					}

					if (items.airinglist_state === "visible") {
						$('#show_hide_seasons').text("(Hide Seasons List)");
						$('.seasonList').show();
					} else if (items.airinglist_state === "hidden") {
						$('#show_hide_seasons').text("(Show Seasons List)");
						$('.seasonList').hide();
					} else {
						$('#show_hide_seasons').text("(Hide Seasons List)");
						$('.seasonList').show();
					}

				});

				$(document).on('click', '#show_hide_seasons', function() {
					if ($('.seasonList').is(":hidden")) {
						$('#show_hide_seasons').text("(Hide Seasons List)");
						$('.seasonList').slideToggle(400);
						storage.sync.set({airinglist_state: 'visible'});
					} else if ($('.seasonList').is(":visible")) {
						$('.seasonList').slideToggle(400);
						setTimeout(function() {
							$('#show_hide_seasons').text("(Show Seasons List)");
						}, 400);
						storage.sync.set({airinglist_state: 'hidden'});
					}
				});

			});

		}

		////////////////
		// Pinned Box //
		////////////////

		if (items.enablePinnedBox === true) {

			if (items.enableAltPinnedBox === true) {

				$('#leftside .bigBarContainer').before('<div id="PinnedBox" class="altPinnedBox"></div>');
				AltPinnedBox();

			} else {

				if ($('.welcome-box').length === 0) 
					$('#rightside').prepend('<div id="PinnedBox"></div>');
				else 
					$('.welcome-box').after('<div id="PinnedBox"></div>');

				PinnedBox();

			}

		}

	});

	function PinnedBox() {

		$('#PinnedBox').append(`
			<div id="PinnedBoxTitle">Pinned <span id="editPinned">Edit</span></div>
			<div id="PinnedBoxContent">
				<div class="arrow-general"></div>
				<div id="PinnedList"></div>
			</div>
		`);

		var star = chrome.extension.getURL('images/star.png');
		var deleteimg = chrome.extension.getURL('images/delete.png');
		var editMode = false;

		storage.sync.get(["PinnedList", "PinnedListURLs", "PinnedListLW", "PinnedListImg"], function(items) {

			if (items.PinnedList == null || items.PinnedList.length == 0) {

				$('#PinnedList').html(`
					You do not have any pinned Anime.
					To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file via the options page.
				`);

			} else {

				var PinnedList = items.PinnedList;
				var PinnedListURLs = items.PinnedListURLs;
				var PinnedListImg = items.PinnedListImg;
				var PinnedListLW = items.PinnedListLW;

				for (var i in PinnedList) {

					$('#PinnedList').append(`
						<div>
							<img class="mi" style="width: 12px" src="/Content/images/bullet.png"> <a class="pinned-item" id="pinned${i}" href="${PinnedListURLs[i]}" data-img="${PinnedListImg[i]}">${PinnedList[i]}</a>
						</div>
					`);

					document.getElementById(`pinned${i}`).dataset.lw = JSON.stringify(PinnedListLW[i]); // I WAS HERE

				}

				asunabestgirl();

			}

			$('#editPinned').click(function() {

				if (editMode) {

					editMode = false;

					$('.mi')
						.attr('src', '/Content/images/bullet.png')
						.css('cursor','default')
						.unbind();

					console.log('Essentials for KissAnime: Edit Mode Disabled');

				} else {

					editMode = true;

					$('.mi').attr('src', deleteimg).css('cursor','pointer').click(function() {

						trash($(this).next().attr('href'));
						$(this).parent().remove();

					});

					console.log('Essentials for KissAnime: Edit Mode Enabled');

					$('#PinnedList').sortable({
						update: function() {

							var updatePinnedList = [];
							var updatePinnedURLs = [];
							var updatePinnedLW = [];
							var updatePinnedImg = [];

							$('.pinned-item').each(function() {
								updatePinnedList.push($(this).text());
								updatePinnedURLs.push($(this).attr('href'));
								updatePinnedListLW.push(JSON.parse($(this).attr('data-lw')));
								updatePinnedListImg.push($(this).attr('data-img'));
							});

							storage.sync.set({
								PinnedList: updatePinnedList,
								PinnedListURLs: updatePinnedURLs,
								PinnedListLW: updatePinnedLW,
								PinnedListImg: updatePinnedImg
							});

						}
					});

					$('.pinned-item').on('mouseover click', function() {
						event.preventDefault()
					});

				}

			});

			$('html').mouseleave(function() {

				editMode = false;

				$('.mi').attr('src', '/Content/images/bullet.png').css('cursor','default').unbind();

			});

		});

		/* == Removes Anime from Pinned List ==  */
		function trash(yourWaifu) {

			storage.sync.get(['PinnedList','PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

				var PinnedList = items.PinnedList;
				var PinnedListURLs = items.PinnedListURLs;
				var PinnedListLW = items.PinnedListLW;
				var PinnedListImg = items.PinnedListImg;
				var AnimePos = PinnedListURLs.indexOf(yourWaifu);

				PinnedList.splice(AnimePos, 1);
				PinnedListURLs.splice(AnimePos, 1);
				PinnedListLW.splice(AnimePos, 1);
				PinnedListImg.splice(AnimePos, 1);

				storage.sync.set({
					PinnedList: PinnedList,
					PinnedListURLs: PinnedListURLs,
					PinnedListLW: PinnedListLW,
					PinnedListImg: PinnedListImg
				});

				if (PinnedList.length == 0) {
					$('#PinnedList').html('You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file via the options page.');
				}

			});

		}

		/* == Tooltip for Pinned Anime / Latest Episode Number for Pinned Anime ==  */
		function asunabestgirl() {

			/* == This part was rewritten like this since I don't want to be making so many requests at once. I will change this once async functions are available == */

			var elements = [];
			var index = 0;

			for (var i of document.querySelectorAll('#PinnedList a')) {
				elements.push(i);
			}

			(function getInfo() {

				var $this = $(elements[index]);
				var href = $this.attr('href');
				var title = $this.text();

				index++;

				$.ajax({
					url: href,
					attempts: 0,
					maxAttempts: 5,
					success: function(data) {

						var img = $(data).find('#rightside .barContent img').first().attr('src');
						var desc = $(data).find('#leftside > .bigBarContainer > .barContent > div:nth-child(2) > p:nth-last-of-type(2)').text();

						$this.attr('title', `
							<img width='120px' height='165px' src=${img} style='float: left; padding-right: 10px' />
							<div style='float: left; width: 320px'>
								<a class='bigChar' href=${href}>${title}</a>
								<p style='height:110px;overflow-y:scroll'>${desc}</p>
							</div>
						`);

						var latestEpisodeURL = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').attr('href');
						var latestEpisodeNumber = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').text().replace(/.*(?=Episode)/i, '');

						if (latestEpisodeURL !== null) $this.after(` <a href=${latestEpisodeURL} class='PinnedLatestEpisode'>${latestEpisodeNumber}</a>`);

						$$("#PinnedList a[title]").tooltip({ offset: [5, 0], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });

						if (index < elements.length) setTimeout(function() { getInfo(); }, 200);

					},
					error: function() {
						this.attempts++;
						if (this.attempts < this.maxAttempts) return $.ajax(this);
						console.log('%cEssentials for KissAnime: Could not retrive information for ' + title, 'color:red');
						if (index < elements.length) setTimeout(function() { getInfo(); }, 200);
					}
				});

			})();

			// $('#PinnedList a').each(function() {
			//
			// 	var $this = $(this);
			// 	var href = $(this).attr('href');
			// 	var title = $(this).text();
			//
			// 	$.ajax({
			// 		url: href,
			// 		attempts: 0,
			// 		maxAttempts: 5,
			// 		success: function(data) {
			//
			// 			var img = $(data).find('#rightside .barContent img').first().attr('src');
			// 			var desc = $(data).find('#leftside > .bigBarContainer > .barContent > div:nth-child(2) > p:nth-last-of-type(2)').text();
			//
			// 			if (desc.length > 200) desc = $.trim(desc).substring(0, 200) + "...";
			//
			// 			$this.attr('title', `
			// 				<img width='120px' height='165px' src=${img} style='float: left; padding-right: 10px' />
			// 				<div style='float: left; width: 320px'>
			// 					<a class='bigChar' href=${href}>${title}</a>
			// 					<p>${desc}</p>
			// 				</div>
			// 			`);
			//
			// 			var latestEpisodeURL = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').attr('href');
			// 			var latestEpisodeNumber = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').text().replace(/.*(?=Episode)/i, '');
			//
			// 			if (latestEpisodeURL !== null) $this.after(` <a href=${latestEpisodeURL} class='PinnedLatestEpisode'>${latestEpisodeNumber}</a>`);
			//
			// 			$$("#PinnedList a[title]").tooltip({ offset: [5, 0], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });
			//
			// 		},
			// 		error: function() {
			// 			if (this.attempts < this.maxAttempts) return $.ajax(this);
			// 			console.log('%cEssentials for KissAnime: Could not retrive information for '+title, 'color:red')
			// 		}
			// 	});
			//
			// });

		}

		/* == onChanged ==  */
		var onChangedTimeout;

		storage.onChanged.addListener(function(changes, namespace) {

			for (key in changes) {

				var changedKeys = changes[key];

				if (key == "PinnedList" && editMode == false) {

					clearTimeout(onChangedTimeout);

					onChangedTimeout = setTimeout(function() {

						storage.sync.get(['PinnedList', 'PinnedListURLs'], function(items) {

							$('#PinnedList').empty();

							var PinnedList = items.PinnedList;
						 	var PinnedListURLs = items.PinnedListURLs;

							for (var i in PinnedList) {
								$('#PinnedList').append(`<div><img class="mi" style="width: 12px" src="/Content/images/bullet.png"> <a href="${PinnedListURLs[i]}">${PinnedList[i]}</a></div>`);
							}

							if (items.PinnedList.length == 0) {
								$('#PinnedList').html('You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file via the options page.');
							}

							asunabestgirl();

						});

					}, 3000);

				}

			}

		});

	}

	function AltPinnedBox() {

		/* == Creates the Alt Pinned Box -- */
		$('#PinnedBox').append(`
			<div id="PinnedBoxTitle">
				<span>Pinned</span>
				<span id="editPinned" style="display:none">Edit</span>
			</div>
			<div id="PinnedBoxContent">
				<div class="arrow-general"></div>
				<div id="loadingContainer" style="text-align:center">
					<div id="loading"></div>
					<div>Loading Pinned List. Please Wait...</div>
					<br>
				</div>
				<div id="PinnedList" class="altPinnedList"><table><tbody><tr></tr></tbody></table></div>
				<div id="emptyPinnedList">You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file via the options page.</div>
			</div>
		`);

		/* == Edit Mode Variable == */
		var editMode = false;

		storage.sync.get(["PinnedList", "PinnedListURLs", "PinnedListLW", "PinnedListImg"], function(items) {

			if (items.PinnedList === null || items.PinnedList.length === 0) { // If Pinned List is empty or doesn't exist
				$('#PinnedList, #loadingContainer').hide();
				$('#emptyPinnedList').show();
			} else { // We have something in our Pinned list \o/
				animeruinedmylife(items.PinnedList, items.PinnedListURLs, items.PinnedListLW, items.PinnedListImg, items.PinnedList.length);
			}

			/* == Edit Button JS == */
			$('#editPinned').click(function() {

				if (editMode) {

					editMode = false;

					console.log('Essentials for KissAnime: Edit Mode disabled');

					$('.altPinnedItem').unbind();
					if ($("#PinnedList tr").sortable("instance")) $("#PinnedList tr").sortable("destroy");
					$('.altPinnedRemove').slideUp(300);

				} else {

					editMode = true;

					console.log('Essentials for KissAnime: Edit Mode enabled');

					$('.altPinnedRemove').slideDown(300);

					$('.altPinnedRemove').one('click', function() {
						event.preventDefault();
						trash($(this).parent().attr('href'));
						$(this).parent().parent().animate({width: 'toggle'}, 300, function() {
							$(this).parent().remove();
						});
					});

					$('#PinnedList tr').sortable({
						placeholder: "ui-state-highlight",
						revert: true,
						axis: 'x',
						update: function() {

							var updatePinnedList = [];
							var updatePinnedURLs = [];
							var updatePinnedLW = [];
							var updatePinnedImg = [];

							$('.altPinnedItem').each(function() {
								updatePinnedList.push(decodeURI($(this).attr('data-title')));
								updatePinnedURLs.push($(this).attr('href'));
								updatePinnedLW.push(JSON.parse($(this).attr('data-lw')));
								updatePinnedImg.push($(this).find('.altPinnedImg').attr('src'));
							});

							storage.sync.set({
								PinnedList: updatePinnedList,
								PinnedListURLs: updatePinnedURLs,
								PinnedListLW: updatePinnedLW,
								PinnedListImg: updatePinnedImg
							});

						}
					});

					$('.altPinnedItem').click(function() { event.preventDefault() });

				}

			});

			$('html').mouseleave(function() {

				editMode = false;

				if ($("#PinnedList tr").sortable("instance")) $("#PinnedList tr").sortable("destroy");
				$('.altPinnedItem').unbind();
				$('.altPinnedRemove').slideUp(300);

			});

			$('#PinnedList').on('mousewheel', function(event) {
				this.scrollLeft -= (event.originalEvent.deltaY < 0 ? 20 : -20);
				event.preventDefault();
			});

		});

		// Removes anime from pinned list
		function trash(yourWaifu) {

			storage.sync.get(['PinnedList','PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

				var PinnedList = items.PinnedList;
				var PinnedListURLs = items.PinnedListURLs;
				var PinnedListLW = items.PinnedListLW;
				var PinnedListImg = items.PinnedListImg;
				var AnimePos = PinnedListURLs.indexOf(yourWaifu);

				PinnedList.splice(AnimePos, 1);
				PinnedListURLs.splice(AnimePos, 1);
				PinnedListLW.splice(AnimePos, 1);
				PinnedListImg.splice(AnimePos, 1);
				storage.sync.set({
					PinnedList,
					PinnedListURLs,
					PinnedListLW,
					PinnedListImg
				});

				if (items.PinnedList.length === 0) {
					$('#PinnedList').slideUp(400);
					$('#emptyPinnedList').slideDown(400);
				}

			});

		}

		// Sets the anime
		function animeruinedmylife(a, b, c, d, e) {

			var i = 0;
			var titles = a;
			var urls = b;
			var lw = c;
			var img = d;
			var length = e;

			storage.sync.get(function(items) {

				// Start Date Check //

				var now = Date.now();
				var extendedTime = 1209600000; // 14 Days

				if (!items.PinnedListTimeUpdate) {

					storage.sync.set({ PinnedListTimeUpdate: now + extendedTime });

				} else if (now >= items.PinnedListTimeUpdate) {

					console.log('Essentials for KissAnime: Refreshing Images');

					img = new Array(titles.length).fill(null);

					storage.sync.set({ PinnedListTimeUpdate: now + extendedTime });

				} else {

					console.log('%c KissEssentials %c Pinned List %c No Update Needed ', logStyleBeginning, logStyleMiddle, logStyleEnd);
					

				}

				// End Date Check //

				$('#loadingContainer').slideDown(500, function() {

					$('#loading').progressbar({max: length, value: 0.001});

					jetFuelCantMeltDankAnimeMemes();

				});


				function jetFuelCantMeltDankAnimeMemes() {

					// If the image url is already stored we don't need to retrieve it //
					if (img[i]) {

						var title = titles[i]; // Shortens Title
						if (title.length > 34) title = title.substring(0, 30) + '...'; // Shortens Title

						$('#PinnedList tr').append(`
							<td valign="top">
								<div style="position:relative">
									<a class="altPinnedItem" href="${urls[i]}">
										<img class="altPinnedRemove" src="${chrome.runtime.getURL('images/delete.png')}">
										<div class="overlay" data-overlayID="${i}"></div>
										<img class="altPinnedImg" src="${img[i]}">
										<div>${title}</div>
									</a>
								</div>
							</td>
						`);

						$(`.altPinnedItem[href="${urls[i]}"]`)[0].dataset.title = titles[i];
						$(`.altPinnedItem[href="${urls[i]}"]`)[0].dataset.lw = JSON.stringify(lw[i]);

						if (lw[i] !== null)
							$('#PinnedList td:last-child .altPinnedImg').after(`<div><span style='color:white'>${lw[i].continuing ? 'Last' : 'Next'}:</span> <a href=${lw[i].path} class='PinnedLW'>${lw[i].episode}</a></div>`);

						i++;

						$('#loading').progressbar("value", i);

						if (i < length) {
							jetFuelCantMeltDankAnimeMemes();
						} else {

							setTimeout(function() {
								$('#loadingContainer').slideUp(400, function() {
									$('#loading').progressbar('destroy');
								});
							}, 500);

							$('#PinnedList').slideDown(400);

							$('#editPinned').fadeIn(100);

							ihatemylife();

							// $('#PinnedList').slideDown(500, function() {
							//
							// 	$('#loadingContainer').slideUp(400, function() {
							// 		$('#loading').progressbar('destroy');
							// 	});
							//
							// 	$('#PinnedList').slideDown(400);
							//
							// 	$('#editPinned').fadeIn(100);
							//
							// 	ihatemylife();
							//
							// });

						}

						if (i == 6) $('#PinnedList').slideDown(500);

					} else {

						storage.sync.get('PinnedListImg', function(items) {

							$.ajax({
								url: urls[i],
								type: 'GET',
								timeout: 15000,
								success: function(data) {

									var imgURL = $(data).find('#rightside .barContent img:first-child').attr('src');
									var title = titles[i]; // Shortens Title
									if (title.length > 34) title = title.substring(0, 30) + '...'; // Shortens Title

									$('#PinnedList tr').append(`
										<td valign="top">
											<div style="position:relative">
												<a class="altPinnedItem" href="${urls[i]}">
													<img class="altPinnedRemove" src="${chrome.runtime.getURL('images/delete.png')}">
													<div class="overlay" data-overlayID="${i}"></div>
													<img class="altPinnedImg" src="${imgURL}">
													<span>${title}</span>
												</a>
											</div>
										</td>
									`);

									$(`a[href="${urls[i]}"]`)[0].dataset.title = titles[i];
									$(`a[href="${urls[i]}"]`)[0].dataset.lw = JSON.stringify(lw[i]);

									if (lw[i] !== null)
										$('#PinnedList td:last-child .altPinnedImg').after(`<div><span style='color:white'>${lw[i].continuing ? 'Last' : 'Next'}:</span> <a href=${lw[i].path} class='PinnedLW'>${lw[i].episode}</a></div>`);

									// Saves the image url to storage for later use //
									var updatePinnedImg = items.PinnedListImg;
									updatePinnedImg[i] = imgURL;
									storage.sync.set({PinnedListImg: updatePinnedImg});

									i++;

									$('#loading').progressbar("value", i);

									if (i < length) {
										jetFuelCantMeltDankAnimeMemes();
									} else {
										setTimeout(function() {
											$('#loadingContainer').slideUp(400, function() {
												$('#loading').progressbar('destroy');
											});
										}, 500);
										$('#PinnedList').slideDown(400);
										$('#editPinned').fadeIn(100);
										ihatemylife();
									}

									if (i == 6) $('#PinnedList').slideDown(400);

								},
								error: function() {
									jetFuelCantMeltDankAnimeMemes();
								}
							});

						});

					}

				}

				function ihatemylife() {

					// This will get the Latest Episode Link
					$('#PinnedList .altPinnedItem').each(function() {

						$(this).find('.overlay').append('<div class="loading-pulse" style="position:absolute"></div>');

						var $this = $(this);

						$.ajax({
							url: $this.attr('href'),
							attempts: 0,
							maxAttempts: 5,
							success: function(data) {

								$this.find('.loading-pulse').remove();

								var summary = $(data).find('p span:contains("Summary:")').parent().next().text().replace(/"/g, '&quot;');

								var summaryHTML = `
									<div style='float: left;'>
										<h3 style='font-size:initial;margin:0'>Summary</h3>
										<p style='height:110px;overflow-y:auto;padding-right:10px'>${summary}</p>
									</div>
								`;

								$this.find('.overlay').append(`<a style="font-size:21px;top:5px" class="glyphicon glyphicon-info-sign pinnedInfo" title="${summaryHTML}"></a>`);

								$$(".pinnedInfo[title]").tooltip({ offset: [0, 0], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });

								var latestEpisodeURL = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').attr('href');
								var latestEpisodeNumber = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').text().replace(/.*(?=Episode)/i, "");
								var animeStatus = $(data).find('.info:contains("Status:")').parent().text().match(/(Completed|Ongoing|Not Yet Aired)/gim, '')[0];

								if (latestEpisodeURL !== null) $this.find('.altPinnedImg').after(`<div><span style='color:white'>Latest:</span> <a href=${latestEpisodeURL} class='PinnedLatestEpisode'>${latestEpisodeNumber}</a></div>`);

								if (animeStatus === 'Completed')
									$this.find('.altPinnedImg').css('border-color', 'green');
								else if (animeStatus === 'Ongoing')
									$this.find('.altPinnedImg').css('border-color', 'yellow');

								//if (latestEpisodeURL != null) $this.find('.overlay').append('<a style="font-size:20px;top:5px" class="glyphicon glyphicon-step-forward" href='+latestEpisodeURL+' data-lw="Latest Episode'+latestEpisodeNumber+'"></a>');

								/* == Bookmark Manager == */
								if (Cookies.get('usernameK')) { // If user is logged in
									var tempScript = $(data).find('script:contains("CheckBookmark")').text();
									var animeID = tempScript.match(/animeID=\d+/)[0].replace('animeID=', '');
									$this.find('.overlay').append(`<a style="font-size:21px;top:5px" class="manageBookmark glyphicon glyphicon-bookmark" data-animeID=${animeID} data-bookmarkStatus="-1" data-text="Manage Bookmark"></a>`);
								}

								/* == Reddit Discussions == */
								if (items.enableFindRedditDiscussions == true) {
									var AnimeTitle = $(data).find('.barContent > div > a.bigChar').text().replace(' (Sub)', '').replace(' (Dub)', '').trim();
									var OtherNamesArray = [];
									$(data).find('span:contains("Other name:")').parent().find('a').each(function() {
										OtherNamesArray.push($(this).text());
									});
									$this.find('.overlay').append('<div class="redditLinks"><a href="https://www.reddit.com/r/anime/search?q=subreddit%3Aanime+self%3Ayes+title%3A%22%5BSpoilers%5D%22+title%3A%22%5BDiscussion%5D%22+%28selftext%3AMyAnimelist+OR+selftext%3AMAL%29+%28title%3A%22'+AnimeTitle.replace('(TV)','')+'%22+OR+title%3A%22'+OtherNamesArray[0]+'%22+OR+title%3A%22'+OtherNamesArray[OtherNamesArray.length - 1]+'%22%29&restrict_sr=on&sort=new&t=all" target="_blank"><img src='+chrome.runtime.getURL('images/reddit-logo.png')+'></a></div>')
								}

							},
							error: function() {
								this.attempts++; if (this.attempts <= this.maxAttempts) $.ajax(this);
								else console.error('Alt Pinned List: Max ajax attempts reached!');
								$this.find('.loading-pulse').remove();
							}
						});

					});

					$(document).on('click', '.manageBookmark', function() {

						var _this = this;

						if (!_this.isLoading) {

							_this.isLoading = true;

							var $this = $(this);
							var animeID = $(this).attr('data-animeID');

							$this.attr('data-text', 'Loading...');

							switch($this.attr('data-bookmarkStatus')) {
								case "-1":
									$.ajax({
										url: '/CheckBookmarkStatus',
										type: 'POST',
										data: `animeID=${animeID}`,
										attempts: 0,
										maxAttempts: 3,
										success: function(data) {

											if (data !== '') { // I guess to make sure there is a response. Idk what KissAnime is thinking. Could've just sent a response with true | false instead of sending nothing. But whatever.

												var arry = data.split('|');

												if (arry[0] != 'null') {

													$this.attr({
														'data-bookmarkStatus': '1',
														'data-text': 'Remove from Bookmarks'
													}).addClass('glyphicon-remove-circle');

												} else {

													$this.attr({
														'data-bookmarkStatus': '0',
														'data-text': 'Add to Bookmarks'
													}).addClass('glyphicon-ok-circle');

												}

												_this.isLoading = false;

											}

										},
										error: function() {

											this.attempts++;

											if (this.attempts <= this.maxAttempts) $.ajax(this);
											else {
												alert('Request timed out!');
												$this.attr('data-text', 'Manage Bookmark');
												_this.isLoading = false;
											}

										}
									});
									break;
								case "0":
									$.ajax({
										url: `${window.location.origin}/Bookmark/${animeID}/add`,
										type: 'POST',
										attempts: 0,
										maxAttempts: 3,
										success: function(data) {

											if (data != '') {

												$this.attr({
													'data-bookmarkStatus': '1',
													'data-text': 'Remove from Bookmarks'
												}).removeClass('glyphicon-ok-circle').addClass('glyphicon-remove-circle');

											} else {



											}

											_this.isLoading = false;

										},
										error: function() {

											this.attempts++;

											if (this.attempts <= this.maxAttempts) $.ajax(this);
											else {
												alert('Request timed out!');
												$this.attr('data-text', 'Add to Bookmarks');
												_this.isLoading = false;
											}

										}
									});
									break;
								case "1":
									$.ajax({
										url: `${window.location.origin}/Bookmark/${animeID}/remove`,
										type: 'POST',
										attempts: 0,
										maxAttempts: 3,
										success: function(data) {

											if (data != '') {

												$this.attr({
													'data-bookmarkStatus': '0',
													'data-text': 'Add to Bookmarks'
												}).removeClass('glyphicon-remove-circle').addClass('glyphicon-ok-circle');

											} else {

											}

											_this.isLoading = false;

										},
										error: function() {
											this.attempts++;
											if (this.attempts <= this.maxAttempts) $.ajax(this);
											else {
												alert('Request timed out!');
												$this.attr('data-text', 'Remove from Bookmarks');
												_this.isLoading = false;
											}
										}
									});
									break;
							}

						} else console.log('Essentials for KissAnime: Already in Progress');

						event.preventDefault();

					});

				}

			});

		}

		/* == On Change == */
		var onChangedTimeout;

		storage.onChanged.addListener(function(changes, namespace) {

			for (key in changes) {

				var changedKeys = changes[key];

				if (key === "PinnedList" && editMode === false) {

					clearTimeout(onChangedTimeout);

					onChangedTimeout = setTimeout(function() {

						storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

							$('#PinnedList').slideUp(400, function() {

								$('#PinnedList tr').empty();

								if (items.PinnedList.length === 0) {

									$('#emptyPinnedList').slideDown(400);

								} else {

									$('#emptyPinnedList').slideUp(400);
									$('#editPinned').fadeOut(100);

									animeruinedmylife(items.PinnedList, items.PinnedListURLs, items.PinnedListLW, items.PinnedListImg, items.PinnedList.length);

								}

							});

						});

					}, 3000);

				}

			}

		});

	}

	////////////////////////////////////////////////////////////////////////////////
	// Any element with the "notice" class will have a tooltip when hovered over. //
	////////////////////////////////////////////////////////////////////////////////

	function tooltip() {
		$$(".notice[title]").tooltip({ offset: [5, 0], effect: 'slide', predelay: 200, tipClass: 'notice-tooltip' }).dynamic({ bottom: { direction: 'down', bounce: true} });
	}

	////////////////////////////////////////////////////////////////////
	//Adds Options, Changelog, and Subbreddit link to homepage navbar //
	////////////////////////////////////////////////////////////////////

	$('#navsubbar > p').append(`| <a id="options_link" href=${chrome.runtime.getURL("options.html")} target="_blank">Essentials for KissAnime Options</a>`);

	storage.sync.get(['recentlyupdated', 'firstinstall'], function(items) {
		if (items.recentlyupdated == true) {
			$('#optionslink').after(' | <a id="changeloglink" href="https://ke.pilar.moe/changelog" target="_blank">Essentials for KissAnime Changelog</a>');
			storage.sync.set({ recentlyupdated: false });
		}
	});

	storage.sync.get(function(items) {

		//////////////////////////////////////////
		// Add Last Watched Anime to the navbar //
		//////////////////////////////////////////

		if ((items.enableLastVideo || items.enableLastVideo === undefined) && items.lastVideo)
			$('#navsubbar > p').append(` | <a href='${items.lastVideo.path}'>Last Watched: ${items.lastVideo.title} ${items.lastVideo.episode}</a>`);

	});

	storage.local.get(function(items) {

		//////////////////////////////////////////
		// Displays Username in the welcome box //
		//////////////////////////////////////////

		if (items.user === "Not Logged In")
			$('.welcome-box-text').html('Welcome! You are not logged in.');
		else
			$('.welcome-box-text').prepend('<div id="welcomemsg">Welcome, <span style="font-weight:bold;color:lightblue;">'+items.user+'</span>.</div>');

	});

	////////////////////////////
	// Fixes RightBox Spacing //
	////////////////////////////

	setTimeout(function() {
		$('#rightside .clear2').remove();
		$('.rightBox').after('<div class="clear2"></div>');
	}, 2000);

	//////////////////////////////////////////////////////////
	//                      HOME PAGE                       //
	//////////////////////////////////////////////////////////

	///////////////////////////////////
	// Set Alternate Recent List Box //
	///////////////////////////////////

	storage.sync.get(function(items) {

		if (items.enableAltRecentList == true) {

			/* == Clean Up == */
			$('#leftside > .bigBarContainer > .barContent').attr('id', 'recent-updates');
			$('#recently-nav').remove();
			$('#recent-updates').empty();
			$('#recent-updates').removeClass();
			$('#recent-updates').prev().attr('id', 'recent-updates-title');
			$('#recent-updates-title > div.clear').remove();

			/* == Create Stuff == */
			$('#recent-updates-title').append(`
				<div class="refresh-recents">
					<img style="height:20px" id="refresh-img" src='${chrome.extension.getURL('images/refresh-icon.png')}'>
				</div>
				<div id="status"></div>
			`);

			/* == Create More Stuff == */
			$('#recent-updates').append(`
				<div class='arrow-general'></div>
				<div class='loading-pulse recent-loading' style='margin: auto auto 10px auto;'></div>
				<div id="_listing"></div>
			`);

			/* == Misc Functions == */
			var recentUpdates = {
				statusTimeout: null,
				start: function() {
					$('#_listing').hide();
					this.statusText("Loading... Please Wait...");
					$('.refresh-recents').addClass('spin');
				},
				done: function(clear) {

					if (items.enableDubbedAnime === false) $('.listing tr:contains("(Dub)")').remove();

					$('.listing tr').removeClass();

					$('#_listing').slideDown(400);
					$('.recent-loading').slideUp(400);
					$('.refresh-recents').removeClass('spin');
					if (typeof clear !== 'undefined' && clear === true) this.statusText('');
					$$('.listing td[title]').tooltip({ offset: [10, 200], effect: 'slide', predelay: 300 }).dynamic({ bottom: { direction: 'down', bounce: true} });
				},
				refresh: function() {
					clearTimeout(this.statusTimeout);
					$('#_listing').slideUp(400);
					$('.recent-loading').slideDown(400);
					this.statusText('Refreshing...');
					$('.refresh-recents').addClass('spin');
				},
				statusText: function(s, c, t) {
					$('#status').css('color', 'inherit');
					$('#status').text(s);
					if (typeof c !== 'undefined')
						$('#status').css('color', c);
					if (typeof t !== 'undefined')
						this.statusTimeout = setTimeout(function(){ $('#status').text('') }, t);
				},
				history: {
					current: [],
					old: []
				},
				save: function() {
					recentUpdates.history.current = [];
					$('.listing td:first-child a').each(function() {
						recentUpdates.history.current.push( $(this).text().trim() );
					});
				},
				check: function() {
					recentUpdates.history.old = recentUpdates.history.current;
					recentUpdates.save();
					if ( recentUpdates.history.old.toString() == recentUpdates.history.current.toString() )
						this.statusText('No New Updates', null, 4000);
					else
						this.statusText('New Updates', null, 4000);
				},
				onlyCurrentAiring: function() {
					var currentlyairingArray = [];
					$('.currently-airing-list .list-container a').each(function() {
						currentlyairingArray.push( $(this).attr('href') );
					});
					$('.listing td:first-child > a').each(function() {
						var $this = $(this);
						var href = $(this).attr('href');
						if ($.inArray(href, currentlyairingArray) == -1)
							$this.parent().parent().remove();
					 });
					currentlyairingArray = [];
					this.save();
				}
			}

			var counter = 0, timeout = 20;
			recentUpdates.start();
			$.ajax({
				url: '/AnimeList/LatestUpdate',
				attempts: 0,
				maxAttempts: 5,
				success: function(data) {

					try {
						$('#_listing').append( $(data).find('.listing') );
					} catch (err) {
						$('#_listing').append(`<div>${data}</div>`);
						recentUpdates.done();
						recentUpdates.statusText("Error", "orangered", 4000);
						return;
					}

					if (items.enableShowOnlyAiring == true) {
						var waitforCAL = setInterval(function() {
							console.log('%c KissEssentials %c Currently Airing List %c Checking... ', logStyleBeginning, logStyleMiddle, logStyleEnd);
							if ($('.season-list').data('loaded') === true) {
								$.ajax({
									url: "/AnimeList/LatestUpdate?page=2",
									attempts: 0,
									maxAttempts: 5,
									success: function(dataPage2) {
										var tempHTML = $('<div>').html(dataPage2).find('tbody');
										tempHTML.children('.head, .head + tr').remove();
										$('.listing tbody').append( tempHTML.html() );
										recentUpdates.onlyCurrentAiring();
										recentUpdates.done(true);
									},
									error: function() {
										this.attempts++; if (this.attempts <= this.maxAttempts) $.ajax(this);
									}
								});
								clearInterval(waitforCAL);
								console.log('%c KissEssentials %c Currently Airing List %c Loaded! ', logStyleBeginning, logStyleMiddle, logStyleEnd);
							}
							counter++; if (counter == timeout) {
								clearInterval(waitforCAL);
								console.log('%c KissEssentials %c Currently Airing List %c Could not be loaded. ', logStyleBeginning, logStyleMiddle, logStyleEnd);
								recentUpdates.done();
								recentUpdates.statusText("Currently Airing List could not be Loaded.", "orangered", 4000);
								$('.refresh-recents').removeClass('spin');
							}
						}, 500);
					} else {
						recentUpdates.save();
						recentUpdates.done(true);
					}

				},
				error: function() {
					this.attempts++; if (this.attempts <= this.maxAttempts) $.ajax(this);
				}
			});

			$('.refresh-recents').click(function() {
				recentUpdates.refresh();
				$.ajax({
					url: '/AnimeList/LatestUpdate',
					attempts: 0,
					maxAttempts: 5,
					success: function(data) {

						$('#_listing').empty();

						try {
							$('#_listing').append( $(data).find('.listing') );
						} catch (err) {
							$('#_listing').append(`<div>${data}</div>`);
							recentUpdates.done();
							recentUpdates.statusText("Error", "orangered", 4000);
							return;
						}

						//$('#_listing').append( $(data).find('.listing') );

						storage.sync.get('enableShowOnlyAiring', function(items) {
							if (items.enableShowOnlyAiring == true) {
								$.ajax({
									url: "/AnimeList/LatestUpdate?page=2",
									success: function(dataPage2) {
										var tempHTML = $('<div>').html(dataPage2).find('tbody');
										tempHTML.children('.head, .head + tr').remove();
										$('.listing tbody').append( tempHTML.html() );
										recentUpdates.onlyCurrentAiring();
										recentUpdates.check();
										recentUpdates.done();
									}
								});
							} else {
								recentUpdates.check();
								recentUpdates.done();
							}
						});
						$('.tooltip').remove();
					},
					statusCode: {
						503: function() {
							recentUpdates.statusText("Error: 503 (The Service is Unavailable). Please refresh the page.", "orangered", 20000);
							$('.refresh-recents').removeClass('spin');
						},
						0: function() {
							recentUpdates.statusText("Error: 0 (Unknown Error). Please restart your browser and check your connection.", "orangered", 20000);
							$('.refresh-recents').removeClass('spin');
						}
					},
					error: function() {
						this.attempts++; if (this.attempts <= this.maxAttempts) $.ajax(this);
					}
				});
				event.stopPropagation();
			});

		} else {
			// $('#leftside .bigBarContainer .items img').height('171');
			// $('#leftside .bigBarContainer .scrollable').height('235');
		}

		/* == Removes Banner that appears on the home page == */
		if (items.enableBanner == false) $('.banner').remove();

	});

});
