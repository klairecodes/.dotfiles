chrome.storage.sync.get(["PinnedList", "PinnedListURLs", "PinnedListLW", "PinnedListImg"], function(items) {
	
	if (items.PinnedList == null || items.PinnedList.length == 0) {
		$('#PinnedList').html('You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file via the options page.');
	} else {

		var star = chrome.extension.getURL('images/star.png');
		var deleteimg = chrome.extension.getURL('images/delete.png');
		var bullet = chrome.extension.getURL('images/assets/bullet.png');

		var PinnedList = items.PinnedList;
		var PinnedListURLs = items.PinnedListURLs;
		var PinnedListLW = items.PinnedListLW;
		var PinnedListImg = items.PinnedListImg;

		for (var i in PinnedList) {

			$('#PinnedList').append(`
					<div>
						<img class="mi" style="width:12px;cursor:pointer" src="${bullet}">
						<a href="https://kissanime.ru${PinnedListURLs[i]}" target="_blank" class="animeLink" id="${i}" data-href="${PinnedListURLs[i]}" data-img="${PinnedListImg[i]}">${PinnedList[i]}</a>
					</div>
				`);

			document.getElementById(i).dataset.lw = JSON.stringify(PinnedListLW[i]);

		}

		$('#editPinned').click(function() {

			if ($('#editPinned').attr('data-click-state') == 1) {

				$('#editPinned').attr('data-click-state', 0);
				$('.mi').attr('src', bullet);
				$('.mi').css('cursor','default');
				$('.mi').unbind();

			} else {

				$('#editPinned').attr('data-click-state', 1);

				$('.mi').attr('src', deleteimg);
				$('.mi').css('cursor','pointer');

				$('.mi').click(function() {

					var Anime = $(this).next().attr('href');
					var AnimePos = PinnedList.indexOf(Anime);

					PinnedList.splice(AnimePos, 1);
					PinnedListURLs.splice(AnimePos, 1);
					PinnedListImg.splice(AnimePos, 1);
					PinnedListLW.splice(AnimePos, 1);

					$(this).parent().remove();

					chrome.storage.sync.set({ PinnedList, PinnedListURLs, PinnedListImg, PinnedListLW });

					if (items.PinnedList.length == 0) {
						$('#PinnedList').html('You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file.');
					}

				});

				$('#PinnedList').sortable({
					update: function() {

						var updatePinnedList = [];
						var updatePinnedURLs = [];
						var updatePinnedListLW = [];
						var updatePinnedListImg = [];

						$('.animeLink').each(function() {
							updatePinnedList.push($(this).text());
							updatePinnedURLs.push($(this).attr('data-href'));
							updatePinnedListLW.push(JSON.parse($(this).attr('data-lw')));
							updatePinnedListImg.push($(this).attr('data-img'));
						});

						chrome.storage.sync.set({
							PinnedList: updatePinnedList,
							PinnedListURLs: updatePinnedURLs,
							PinnedListLW: updatePinnedListLW,
							PinnedListImg: updatePinnedListImg
						});

					}
				});

			}

		});
	}

	$('#PinnedList a').each(function() {

		var $this = $(this);
		var href = $(this).attr('href');
		var title = $(this).text();

		$.ajax({
			url: href,
			success: function(data) {

				// Latest Episode URL //
				var latestEpisodeURL = $(data).find('.listing > tbody > tr:nth-child(3) > td > a:contains("Episode")').attr('href');

				// Latest Episode Number //
				var latestEpisodeNumber = "Episode " + $(data).find('.listing tr:nth-child(3) td:first-child a').text().split("Episode ").pop();

				if (latestEpisodeURL !== null) $this.after(` <a href="https://kissanime.ru${latestEpisodeURL}" class="PinnedLatestEpisode" target="_blank">${latestEpisodeNumber}</a>`);

			}
		});

	});

});
