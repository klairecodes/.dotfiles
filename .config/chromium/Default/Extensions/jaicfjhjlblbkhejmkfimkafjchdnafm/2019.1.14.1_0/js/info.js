/* eslint-disable no-redeclare */
/* global chrome $ */

chrome.storage.local.get(function(items) {

	$('#local-setting-values').empty();

	for(var key in items) {

		if (/MAL(pass|auth)/i.test(key))
			$('#local-settings-values').append(`<div><span style="color:skyblue">${key}</span>: <span style="color:#C2FF00;font-weight:bold">hidden</span></div>`);
		else
			$('#local-settings-values').append(`<div><span style="color:skyblue">${key}</span>: <span style="color:#C2FF00">${items[key]}</span></div>`);

	}

});

chrome.storage.sync.get(function(items) {

	if ($.isEmptyObject(items)) {

		$('#sync-settings-values').html('<span style="color: red">Nothing Here.</span>');

	} else {

		$('#sync-setting-values').empty();

		for (var key in items) {

			var item = items[key];

			if (Array.isArray(items[key])) {

				$('#sync-settings-values').append(`<div id="${key}"><span class="keyEntry">${key}</span>: <span>Array</span></div>`);

				for (var index in item) {

					var count = parseInt(index) + 1;

					if (count <= 9)
						count = '0' + count;

					$(`#${key}`).append(`<div><span>[${count}]</span> <span style="color:#C2FF00">${JSON.stringify(item[index])}</span></div>`);

				}

			} else if (typeof items[key] === 'object') {


				$('#sync-settings-values').append(`<div id="${key}"><span class="keyEntry">${key}</span>: <span>Object</span></div>`);

				for (var entry in item) {


					$(`#${key}`).append(`<div><span>${entry}</span>: <span style="color:#C2FF00">${JSON.stringify(item[entry])}</span></div>`);

				}


			} else {

				$('#sync-settings-values').append(`<div id="${key}"><span class="keyEntry">${key}</span>: <span style="color:#C2FF00">${items[key]}</span></div>`);

			}

		}

	}

});

chrome.permissions.getAll(function(permissions) {

	for (var permission of permissions.origins) {

		switch(permission) {
		case '*://*.kissanime.ru/*':
			setDesc('#permissions-origins-values', permission, 'Needed for the extension to work.');
			break;
		case '*://*.myanimelist.net/*':
			setDesc('#permissions-origins-values', permission, 'Needed for the MAL feature to work.');
			break;
		case '*://*.openload.co/*':
			setDesc('#permissions-origins-values', permission, 'Used to replace the Openload Player with the KissAnime player.');
			break;
		}

	}

	for (var permission of permissions.permissions) {

		switch(permission) {
		case 'activeTab':
			setDesc('#permissions-api-values', permission, 'Mandatory Permission. Allows the extension to modify the contents of https://kissanime.ru/ if it is open in a Tab.');
			break;
		case 'downloads':
			setDesc('#permissions-api-values', permission, 'Optional Permission. Allows the extension to download to the user\'s computer. Required for the "Download All" option to work.');
			break;
		case 'downloadsInternal':
			setDesc('#permissions-api-values', permission, 'Optional Permission. Allows the extension to download to the user\'s computer. Required for the "Download All" option to work.');
			break;
		case 'notifications':
			setDesc('#permissions-api-values', permission, 'Mandatory Permission. Used to display notifications.');
			break;
		case 'storage':
			setDesc('#permissions-api-values', permission, 'Mandatory Permission. Allows the extension to save in chrome.storage.');
			break;
		case 'webRequest':
			setDesc('#permissions-api-values', permission, 'Mandatory Permission. Required for webRequestBlocking.');
			break;
		case 'webRequestBlocking':
			setDesc('#permissions-api-values', permission, 'Mandatory Permission. Used to Block Ad Domains that originate from https://kissanime.ru/.');
			break;
		}

	}

});

function setDesc(id, permission, description) {
	$(id).append(`<div>${permission}</div><div class="api-desc" ${description ? '' : 'style="display:none"'}> - <span style="color:skyblue">${description}</span></div>`);
}
