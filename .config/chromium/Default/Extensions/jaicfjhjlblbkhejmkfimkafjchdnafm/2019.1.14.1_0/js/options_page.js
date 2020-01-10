/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* global chrome $ Vue toastr getUrlParameter  Mousetrap*/

/////////////////////////////
// Options Page Javascript //
/////////////////////////////

/////////////////////////////////////////////////
// Prints contents of local storage in console //
/////////////////////////////////////////////////

chrome.storage.local.get(function(data) {
	console.log('Local Storage:');
	console.log(data);
});

chrome.storage.sync.get(function(data) {
	console.log('Sync Storage:');
	console.log(data);
});

chrome.storage.local.get(['firstinstall', 'recentlyupdated'], function(items) {

	if (items.firstinstall == true) {

		$('#first-install-modal').modal({backdrop:'static',keyboard:false}).one('click', '#first-install-modal-close', function() {
			$('#first-install-modal').modal('hide');
			chrome.storage.local.set({firstinstall: false});
		});

	}

	if (items.recentlyupdated == true) {

		$.get('https://ke.pilar.moe/api/v2/changelog', function(data) {

			var current = data.find(e => e.current);

			new Vue({
				el: '#updated-modal',
				data: {
					changelog: current
				}
			});

			$('#updated-modal .modal-title').text('What\'s New - ' + current.name);

			$('#updated-modal').modal({ backdrop:'static', keyboard:false }).one('click', '#updated-modal-close', function() {
				$('#updated-modal').modal('hide');
				chrome.storage.local.set({ recentlyupdated: false });
			});

		});

	}
});

$.get('https://ke.pilar.moe/api/v2/check', function () {
	$('#apiCheck1').text('Api Status 1: Working');
}).fail(function() {
	$('#apiCheck1').text('Api Status 1: Not Working');
});

$.post('https://ke.pilar.moe/api/v2/check', function () {
	$('#apiCheck2').text('Api Status 2: Working');
}).fail(function() {
	$('#apiCheck2').text('Api Status 2: Not Working');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Displays either a "Updated!" or "New!" label next to options that were either just added or updated //
/////////////////////////////////////////////////////////////////////////////////////////////////////////

chrome.storage.local.get(['firstinstall','recentlyupdated'], function(items) {
	if (items.firstinstall == true || items.recentlyupdated == true) {
		$('.new').css('display', 'inline');
	}
});

$('input[type="checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
	chrome.storage.local.get(['firstinstall','recentlyupdated'], function(items) {
		if (items.firstinstall == false || items.recentlyupdated == false) {
			$('#clearoptions').css('display', 'block');
		}
	});
});

/////////////////////////////
// Updates Supporters List //
/////////////////////////////

var defaultContributors = [
	'RedRein001',
	'Harry G.',
	'Alaradia',
	'XD',
	'GOATCorps',
	'Conrad C.',
	'AlcoholicNZ'
].reverse();

for (var contributor of defaultContributors) {
	$('#contributors').prepend(`<li>${contributor}</li>`);
}

$.ajax({
	url: 'https://ke.pilar.moe/api/v2/supporters',
	success: function(data) {
		console.log(data);
		$('#contributors').empty();
		for (var i of data) {
			$('#contributors').append(`<li>${i}</li>`);
		}
		$('#contributors').append('<a href="https://ke.pilar.moe/supporters">All Supporters</a>');
	}
});

//////////////////////////////////
// Shows/Hides the Logo Changer //
//////////////////////////////////

chrome.storage.sync.get('enableCustomLogo', function(items) {
	if (items.enableCustomLogo == true) {
		$('#HeaderLogos').prop('disabled', false);
	}
});

$('input[name="enableCustomLogo"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if ($('[name=\'enableCustomLogo\']').bootstrapSwitch('state')) {
		$('#HeaderLogos').prop('disabled', false);
	} else {
		$('#HeaderLogos').prop('disabled', true);
	}
});

////////////////////////////////////////////////
// Show/Hides the Notification Times Dropdown //
////////////////////////////////////////////////

chrome.storage.sync.get('enableNotifyUpdates', function(items) {
	if (items.enableNotifyUpdates == true) {
		$('#NotifyTimes').prop('disabled', false);
	}
});

$('input[name="enableNotifyUpdates"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if ($('[name=\'enableNotifyUpdates\']').bootstrapSwitch('state')) {
		$('#NotifyTimes').prop('disabled', false);
	} else {
		$('#NotifyTimes').prop('disabled', true);
	}
});

//////////////////////////////////////
// Show Custom Scheme Modal Options //
//////////////////////////////////////

$('#customscheme-modal-open').click(function() {
	$('#customscheme-modal').modal({backdrop:'static',keyboard:false});
});

///////////////////////////////////////
// Loads saved Custom Scheme options //
///////////////////////////////////////

chrome.storage.sync.get(function(items) {
	if (items.cs_background) {
		if (items.cs_background == 'color') {
			$('#radio_cs_background_color').prop('checked', true);
			$('#cs_background_image').hide();
			$('#cs_background_color').show();
		} else if (items.cs_background == 'image') {
			$('#radio_cs_background_image').prop('checked', true);
			$('#cs_background_color').hide();
			$('#cs_background_image').show();
		}
	}
	if (items.cs_background_image) $('#cs_background_image_picker').val(items.cs_background_image);

	$('#customscheme-modal .cs_background_image_position').each(function() {
		if (items[$(this).attr('data-storage-name')]) $('#'+this.id).val( items[$(this).attr('data-storage-name')] );
	});
	$('#customscheme-modal .cs_picker').each(function() {
		if (items[$(this).attr('data-storage-name')]) $('#'+this.id).spectrum('set', items[$(this).attr('data-storage-name')]);
	});
});

///////////////////////////////////////////////////
// Shows/Hides the Solid Color/Image URL options //
///////////////////////////////////////////////////

$('input[type=radio][name=cs_background]').change(function() {
	if (this.value == 'cs_background_color') {
		$('#cs_background_image').hide();
		$('#cs_background_color').show();
		chrome.storage.sync.set({cs_background: 'color'});
	} else if (this.value == 'cs_background_image') {
		$('#cs_background_color').hide();
		$('#cs_background_image').show();
		chrome.storage.sync.set({cs_background: 'image'});
	}
});

///////////////////////////////////////////////////
// Creates and handles the spectrum color picker //
///////////////////////////////////////////////////

$('.cs_picker').spectrum({
	color: '',
	showInput: true,
	showInitial: true,
	allowEmpty: true,
	showAlpha: true,
	preferredFormat: 'hex',
	appendTo: '#customscheme-modal',
	hide: function(color) {
		if (color) {
			var storage = {};
			storage[$(this).attr('data-storage-name')] = color.toRgbString();
			chrome.storage.sync.set(storage);
		} else {
			chrome.storage.sync.remove($(this).attr('data-storage-name'));
		}
	}
});

////////////////////////////////////////////////////////////
// Selects the text in the Image URL box for easier usage //
////////////////////////////////////////////////////////////

$('#cs_background_image_picker').focus(function () {
	$('#cs_background_image_picker').select().mouseup(function (e) {
		e.preventDefault();
		$(this).unbind('mouseup');
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Automatically saves the "URL" to chrome.storage when the user clicks away from the textbox //
////////////////////////////////////////////////////////////////////////////////////////////////

$('#cs_background_image_picker').on('blur', function() {
	if (this.value) chrome.storage.sync.set({cs_background_image: this.value});
	else if (!this.value) chrome.storage.sync.remove('cs_background_image');
});

$('.cs_background_image_position').change(function() {
	var storage  = {};
	storage[$(this).attr('data-storage-name')] = this.value;
	if (this.value) chrome.storage.sync.set(storage);
});

/////////////////////////////
// Resets the color option //
/////////////////////////////

$('#cs_background_color_clear').click(function() {
	$('#cs_background_color_picker').spectrum('set', '');
	chrome.storage.sync.remove('cs_background_color');
});

$('#cs_background_image_clear').click(function() {
	$('#cs_background_image_picker').val('');
	chrome.storage.sync.remove('cs_background_image');
});

$('#cs_background_position_clear').click(function() {
	$('#cs_background_image_position_x_picker').val('center');
	$('#cs_background_image_position_y_picker').val('top');
	chrome.storage.sync.set({cs_background_image_position_x: 'center', cs_background_image_position_y: 'top'});
});

$('#cs_background_image_color_clear').click(function() {
	$('#cs_background_image_color_picker').spectrum('set', '');
	chrome.storage.sync.remove('cs_background_image_color');
});

$('.cs-clear').click(function() {
	var id = '#'+$(this).parent().prev().find('input').attr('id');
	$(id).spectrum('set', '');
	chrome.storage.sync.remove($(id).attr('data-storage-name'));
});

////////////////////////
// Custom Header Logo //
////////////////////////

/*
Used storage values:
- userlogoP1
- userlogoP2
- userlogoP1PosLeft
- userlogoP2PosLeft
- userlogoP1PosTop
- userlogoP2PosTop
*/

//$('#customheaderlogo-modal').modal({backdrop:'static',keyboard:true});
// Opens the Modal //
$('#customheaderlogo-modal-open').click(function() {
	$('#customheaderlogo-modal').modal({backdrop:'static',keyboard:true});
});
// Checks to see if the image is usable and saves it when the textbox goes out of focus //
$('#userlogo').on('blur', function() {
	$('<img>').attr('src', this.value).load(function() {
		if ($(this).attr('src').match(/\.(png|gif|bmp|tiff)$/) != null) {
			var url = $(this).attr('src');
			$('#userlogo-preview h1').css('background-image', 'url(/images/logos/logo-user-template.png), url('+url+')');
			toastr['success']('Image can be used!');
			chrome.storage.sync.set({userlogo: url});
		} else {
			toastr['error']('This image does not support Transparency!');
		}
	}).on('error', function() {
		if ($(this).attr('src') == '') {
			$('#userlogo-preview h1').css('background-image', 'url(/images/logos/logo-user-template.png)');
			chrome.storage.sync.remove('userlogo');
			toastr['success']('User Logo Removed!');
		} else {
			toastr['error']('Not a valid URL');
		}
	});
});

// Clears the textbox and removes the userlogo from chrome.storage //
$('#clear-userlogo').click(function() {
	$('#userlogo').val('');
	$('#userlogo-preview h1').css('background-image', 'url(/images/logos/logo-user-template.png)');
	chrome.storage.sync.remove('userlogo');
	toastr['success']('User Logo Removed!');
});

// Allows changing the position of the logo //
$('.userlogo').change(function() {

	var id = $(this).attr('id');

	if (id == 'userlogo-size' && this.value > 100)
		this.value = '100'; // Prevents input of a number higher than 100
	if (id == 'userlogo-pos-left')
		$('#userlogo-preview h1').css('background-position-x', '0%, '+this.value+'%'); // Sets the background left position in the preview box
	else if (id == 'userlogo-pos-top')
		$('#userlogo-preview h1').css('background-position-y', '50%, '+this.value+'%'); // Sets the background top position in the preview box
	else if (id == 'userlogo-size')
		$('#userlogo-preview h1').css('background-size', 'auto, auto '+this.value+'%'); // Sets the background size in the preview box
	if (this.value == '')
		this.value = '0';

	var userlogoPosLeft = $('#userlogo-pos-left').val();
	var userlogoPosTop = $('#userlogo-pos-top').val();
	var userlogoSize = $('#userlogo-size').val();

	chrome.storage.sync.set({
		userlogoPosLeft: userlogoPosLeft,
		userlogoPosTop: userlogoPosTop,
		userlogoSize: userlogoSize
	});

});

// Loads the saved URL back into the textbox //
chrome.storage.sync.get(['userlogo', 'userlogoPosLeft', 'userlogoPosTop', 'userlogoSize'], function(items) {
	$('#userlogo').val(items.userlogo);
	$('#userlogo-preview h1').css('background-image', 'url(/images/logos/logo-user-template.png), url('+items.userlogo+')');
	if (items.userlogoPosLeft) {
		$('#userlogo-preview h1').css('background-position-x', '0%, '+items.userlogoPosLeft+'%');
		$('#userlogo-pos-left').val(items.userlogoPosLeft);
	}
	if (items.userlogoPosTop) {
		$('#userlogo-preview h1').css('background-position-y', '50%, '+items.userlogoPosTop+'%');
		$('#userlogo-pos-top').val(items.userlogoPosTop);
	}
	if (items.userlogoSize) {
		$('#userlogo-preview h1').css('background-size', 'auto, auto '+items.userlogoSize+'%');
		$('#userlogo-size').val(items.userlogoSize);
	}
});

//////////////////////////////////////////////////////////////////////////////////////////
// Enable/Disable the "Show Only Currently Airing" Option depending on enableWelcomeBox //
//////////////////////////////////////////////////////////////////////////////////////////

chrome.storage.sync.get('enableWelcomeBox', function(items) {
	if (items.enableWelcomeBox == false) {
		$(document).on('DOMContentLoaded', function() {
			$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', true);
		});
	}
});

$('input[name="enableWelcomeBox"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if (!$('[name=\'enableWelcomeBox\']').bootstrapSwitch('state')) {
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('state', false);
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', true);
		chrome.storage.sync.set({ enableShowOnlyAiring: false });
	} else if ($('[name=\'enableWelcomeBox\']').bootstrapSwitch('state') && $('[name=\'enableAltRecentList\']').bootstrapSwitch('state')) {
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', false);
	} else if ($('[name=\'enableWelcomeBox\']').bootstrapSwitch('state') && !$('[name=\'enableAltRecentList\']').bootstrapSwitch('state')) {
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', true);
	}
});

/////////////////////////////////////////////////////////////////////////////////////////////
// Enable/Disable the "Show Only Currently Airing" Option depending on enableAltRecentList //
/////////////////////////////////////////////////////////////////////////////////////////////

chrome.storage.sync.get(['enableAltRecentList', 'enableWelcomeBox'], function(items) {
	if (items.enableAltRecentList == false || items.enableWelcomeBox == false) {
		$(document).ready(function() {
			$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', true);
		});
	}
});

$('input[name="enableAltRecentList"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if ($('[name=\'enableAltRecentList\']').bootstrapSwitch('state') && $('[name=\'enableWelcomeBox\']').bootstrapSwitch('state')) {
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', false);
	} else {
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('state', false);
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('disabled', true);
		chrome.storage.sync.set({enableShowOnlyAiring: false});
	}
});

//////////////////////////////////////////////////////////////////////////////
// Enable/Disable the "Alt Pinned List" Option depending on enablePinnedBox //
//////////////////////////////////////////////////////////////////////////////

chrome.storage.sync.get('enablePinnedBox', function(items) {
	if (items.enablePinnedBox == false) {
		$(document).ready(function() {
			$('[name=\'enableAltPinnedBox\']').bootstrapSwitch('disabled', true);
		});
	}
});

$('input[name="enablePinnedBox"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if (!$('[name=\'enablePinnedBox\']').bootstrapSwitch('state')) {
		$('[name=\'enableAltPinnedBox\']').bootstrapSwitch('state', false);
		$('[name=\'enableAltPinnedBox\']').bootstrapSwitch('disabled', true);
		chrome.storage.sync.set({enableAltPinnedBox: false});
	} else  {
		$('[name=\'enableAltPinnedBox\']').bootstrapSwitch('disabled', false);
	}
});

//////////////////////////////////////////////////////////
// Disable Player features if Custom Player is disabled //
//////////////////////////////////////////////////////////

chrome.storage.sync.get('enableCustomPlayer', function(items) {
	if (items.enableCustomPlayer == false) {
		$('[name=\'enableAutoAdvEp\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableKeyboardShortcuts\']').bootstrapSwitch('disabled', true);
		$('[name=\'enablePlaybackRate\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableAutoHD\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('disabled', true);
		$('[name=\'enablePauseOnSwitch\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableAutoFullscreen\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableAltVideoPage\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableTheaterMode\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableTheaterBacklight\']').bootstrapSwitch('disabled', true);
		$('[name=\'enableStretchFullscreenVid\']').bootstrapSwitch('disabled', true);
	}
});

$('input[name="enableCustomPlayer"]').on('switchChange.bootstrapSwitch', function(event, state) {
	$('[name=\'enableAutoAdvEp\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableKeyboardShortcuts\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enablePlaybackRate\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableAutoHD\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableAutoLQ\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enablePauseOnSwitch\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableAutoFullscreen\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableAltVideoPage\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableTheaterMode\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableTheaterBacklight\']').bootstrapSwitch('disabled', !state);
	$('[name=\'enableStretchFullscreenVid\']').bootstrapSwitch('disabled', !state);
});

/////////////////////////////////////////////
// Enable/Disable the "Auto HD/LQ" Options //
/////////////////////////////////////////////

chrome.storage.sync.get(['enableAutoHD', 'enableAutoLQ'], function(items) {
	if (items.enableAutoHD == true) {
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('disabled', true);
	} else if (items.enableAutoLQ == true) {
		$('[name=\'enableAutoHD\']').bootstrapSwitch('disabled', true);
	}
});

$('input[name="enableAutoHD"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if (state) {
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('state', false);
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('disabled', true);
	} else  {
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('disabled', false);
	}
});

$('input[name="enableAutoLQ"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if (state) {
		$('#enableAutoHD').bootstrapSwitch('state', false).bootstrapSwitch('disabled', true);
	} else  {
		$('#enableAutoHD').bootstrapSwitch('disabled', false);
	}
});

//
//
//

chrome.storage.sync.get([
	'enableAutoFullscreen',
	'enableAltVideoPage',
	'enableTheaterMode',
	'enableTheaterBacklight'
], function(items) {
	if (items.enableAutoFullscreen == true) {
		$('#enableAltVideoPage').bootstrapSwitch('disabled', true);
		$('#enableTheaterMode').bootstrapSwitch('disabled', true);
	} else if (items.enableAltVideoPage == true) {
		$('#enableAutoFullscreen').bootstrapSwitch('disabled', true);
		$('#enableTheaterMode').bootstrapSwitch('disabled', true);
	} else if (items.enableTheaterMode == true) {
		$('#enableAutoFullscreen').bootstrapSwitch('disabled', true);
		$('#enableAltVideoPage').bootstrapSwitch('disabled', true);
	}
	if (items.enableTheaterMode === false) {
		$('#enableTheaterBacklight').bootstrapSwitch('disabled', true);
	}
});

$('#enableAutoFullscreen').on('switchChange.bootstrapSwitch', function(event, state) {
	if (state) {
		$('#enableAltVideoPage, #enableTheaterMode').bootstrapSwitch('state', false);
		$('#enableAltVideoPage, #enableTheaterMode').bootstrapSwitch('disabled', true);
	} else  {
		$('#enableAltVideoPage, #enableTheaterMode').bootstrapSwitch('disabled', false);
	}
});

$('#enableAltVideoPage').on('switchChange.bootstrapSwitch', function(event, state) {
	if (state) {
		$('#enableAutoFullscreen, #enableTheaterMode').bootstrapSwitch('state', false);
		$('#enableAutoFullscreen, #enableTheaterMode').bootstrapSwitch('disabled', true);
	} else  {
		$('#enableAutoFullscreen, #enableTheaterMode').bootstrapSwitch('disabled', false);
	}
});

$('#enableTheaterMode').on('switchChange.bootstrapSwitch', function(event, state) {
	if (state) {
		$('#enableAutoFullscreen, #enableAltVideoPage').bootstrapSwitch('state', false);
		$('#enableAutoFullscreen, #enableAltVideoPage').bootstrapSwitch('disabled', true);
		$('#enableTheaterBacklight').bootstrapSwitch('disabled', false);
	} else  {
		$('#enableAutoFullscreen, #enableAltVideoPage').bootstrapSwitch('disabled', false);
		$('#enableTheaterBacklight').bootstrapSwitch('state', false);
		$('#enableTheaterBacklight').bootstrapSwitch('disabled', true);
	}
});

/////////////////////////
// Displays Help Image //
/////////////////////////

var help_homepage_banner_img = '/images/help/Banner.png';
var help_alt_recents_img = '/images/help/RecentsList.png';
var help_pinned_tooltips_img = '/images/help/Tooltips.png';
var help_latest_episode_img = '/images/help/LatestEpisodeLink.png';
var help_player_switcher_img = '/images/help/PlayerSwitchers.png';
var help_lights_off_img = '/images/help/LightsOff.png';
var help_download_links_img = '/images/help/DownloadLinks.png';
var help_file_name_img = '/images/help/FileName.png';
var help_bookmark_link_img = '/images/help/BookmarkManager.png';

$('.help').click(function() {
	switch(this.id) {
	case 'open-enableBanner-help':
		helpModal(help_homepage_banner_img);
		break;
	case 'open-enableAltRecentList-help':
		helpModal(help_alt_recents_img);
		break;
	case 'open-enablePinnedTooltips-help':
		helpModal(help_pinned_tooltips_img);
		break;
	case 'open-enableLatestEpisode-help':
		helpModal(help_latest_episode_img);
		break;
	case 'open-enablePlayerSwitchers-help':
		helpModal(help_player_switcher_img);
		break;
	case 'open-enableLightsOff-help':
		helpModal(help_lights_off_img);
		break;
	case 'open-enableDownloadLinks-help':
		helpModal(help_download_links_img);
		break;
	case 'open-enableFileName-help':
		helpModal(help_file_name_img);
		break;
	case 'open-enableBookmarkLink-help':
		helpModal(help_bookmark_link_img);
		break;
	}
});

function helpModal(a) {
	$('#help-img').attr('src', a);
	$('#help-images-modal').modal({backdrop:'static',keyboard:true}).one('click', '#close-help-image-modal', function() {
		$('#help-images-modal').modal('hide');
	});
}

$('input').on('switchChange.bootstrapSwitch', function(event, state) {

	console.log(event.target.id, state);

	console.log($('[name=\'enableAds\']').bootstrapSwitch('state'));

	// Whole Site //
	var enableAds = $('[name=\'enableAds\']').bootstrapSwitch('state');
	var enableSocialButtons = $('[name=\'enableSocialButtons\']').bootstrapSwitch('state');
	var enableCommentSections = $('[name=\'enableCommentSections\']').bootstrapSwitch('state');
	var enableCustomLogo = $('[name=\'enableCustomLogo\']').bootstrapSwitch('state');
	var enableSlimHeader = $('[name=\'enableSlimHeader\']').bootstrapSwitch('state');
	var enableNotifyUpdates = $('[name=\'enableNotifyUpdates\']').bootstrapSwitch('state');
	var enableCustomScheme = $('[name=\'enableCustomScheme\']').bootstrapSwitch('state');
	var enableFooter = $('[name=\'enableFooter\']').bootstrapSwitch('state');

	// Home Page //
	var enableWelcomeBox = $('[name=\'enableWelcomeBox\']').bootstrapSwitch('state');
	var enablePinnedBox = $('[name=\'enablePinnedBox\']').bootstrapSwitch('state');
	var enableAltPinnedBox = $('[name=\'enableAltPinnedBox\']').bootstrapSwitch('state');
	var enableBanner = $('[name=\'enableBanner\']').bootstrapSwitch('state');
	var enableAltRecentList = $('[name=\'enableAltRecentList\']').bootstrapSwitch('state');
	var enableShowOnlyAiring = $('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('state');
	var enableLastVideo = $('[name=\'enableLastVideo\']').bootstrapSwitch('state');

	// Anime Page //
	var enableFindinMAL = $('[name=\'enableFindinMAL\']').bootstrapSwitch('state');
	var enableFindinKitsu = $('[name=\'enableFindinKitsu\']').bootstrapSwitch('state');
	var enableFindRedditDiscussions = $('[name=\'enableFindRedditDiscussions\']').bootstrapSwitch('state');

	// Bookmarks Page //
	var relocateAiringBookmarks = $('[name=\'relocateAiringBookmarks\']').bootstrapSwitch('state');

	// Video Page //
	// var enableVideoPageAds = $("[name='enableVideoPageAds']").bootstrapSwitch('state');
	var enableCustomPlayer = $('[name=\'enableCustomPlayer\']').bootstrapSwitch('state');
	var enablePlayerSwitchers = $('[name=\'enablePlayerSwitchers\']').bootstrapSwitch('state');
	var enableLightsOff = $('[name=\'enableLightsOff\']').bootstrapSwitch('state');
	var enableDownloadLinks = $('[name=\'enableDownloadLinks\']').bootstrapSwitch('state');
	var enableFileName = $('[name=\'enableFileName\']').bootstrapSwitch('state');
	var enableBookmarkLink = $('[name=\'enableBookmarkLink\']').bootstrapSwitch('state');
	var enableAutoAdvEp = $('[name=\'enableAutoAdvEp\']').bootstrapSwitch('state');
	var enableKeyboardShortcuts = $('[name=\'enableKeyboardShortcuts\']').bootstrapSwitch('state');
	var enablePlaybackRate = $('[name=\'enablePlaybackRate\']').bootstrapSwitch('state');
	var enableAutoFullscreen = $('[name=\'enableAutoFullscreen\']').bootstrapSwitch('state');
	var enableAltVideoPage = $('[name=\'enableAltVideoPage\']').bootstrapSwitch('state');
	var enableAutoHD = $('[name=\'enableAutoHD\']').bootstrapSwitch('state');
	var enableAutoLQ = $('[name=\'enableAutoLQ\']').bootstrapSwitch('state');
	var enablePauseOnSwitch = $('[name=\'enablePauseOnSwitch\']').bootstrapSwitch('state');
	var enableStretchFullscreenVid = $('[name=\'enableStretchFullscreenVid\']').bootstrapSwitch('state');
	var enableTheaterMode = $('[name=\'enableTheaterMode\']').bootstrapSwitch('state');
	var enableTheaterBacklight = $('[name=\'enableTheaterBacklight\']').bootstrapSwitch('state');

	var enableMALAPI = $('[name=\'enableMALAPI\']').bootstrapSwitch('state');
	chrome.storage.local.set({enableMALAPI: enableMALAPI});

	chrome.storage.sync.set({
		// Whole Site //
		enableAds: enableAds,
		enableSocialButtons: enableSocialButtons,
		enableCommentSections: enableCommentSections,
		enableCustomLogo: enableCustomLogo,
		enableSlimHeader: enableSlimHeader,
		enableNotifyUpdates: enableNotifyUpdates,
		enableCustomScheme: enableCustomScheme,
		enableFooter: enableFooter,

		// Home Page //
		enableWelcomeBox: enableWelcomeBox,
		enablePinnedBox: enablePinnedBox,
		enableAltPinnedBox: enableAltPinnedBox,
		enableBanner: enableBanner,
		enableAltRecentList: enableAltRecentList,
		enableShowOnlyAiring: enableShowOnlyAiring,
		enableLastVideo: enableLastVideo,

		// Anime Page //
		enableFindinMAL: enableFindinMAL,
		enableFindinKitsu: enableFindinKitsu,
		enableFindRedditDiscussions: enableFindRedditDiscussions,

		// Bookmarks Page //
		relocateAiringBookmarks: relocateAiringBookmarks,

		// Video Page //
		// enableVideoPageAds: enableVideoPageAds,
		enableCustomPlayer: enableCustomPlayer,
		enableDownloadLinks: enableDownloadLinks,
		enableLightsOff: enableLightsOff,
		enablePlayerSwitchers: enablePlayerSwitchers,
		enableFileName: enableFileName,
		enableBookmarkLink: enableBookmarkLink,
		enableAutoAdvEp: enableAutoAdvEp,
		enableKeyboardShortcuts: enableKeyboardShortcuts,
		enablePlaybackRate: enablePlaybackRate,
		enableAutoFullscreen: enableAutoFullscreen,
		enableAltVideoPage: enableAltVideoPage,
		enableAutoHD: enableAutoHD,
		enableAutoLQ: enableAutoLQ,
		enablePauseOnSwitch: enablePauseOnSwitch,
		enableStretchFullscreenVid: enableStretchFullscreenVid,
		enableTheaterMode: enableTheaterMode,
		enableTheaterBacklight: enableTheaterBacklight
	});
	message('Options saved.');
});

/////////////////////////////////
// Saves the Header Logo Value //
/////////////////////////////////

function saveHeaderLogos() {
	var HeaderLogos = document.getElementById('HeaderLogos').value;
	chrome.storage.sync.set({HeaderLogos:HeaderLogos});
	message('Options saved.');
}

document.getElementById('HeaderLogos').addEventListener('change', saveHeaderLogos);

function loadHeaderLogos() {
	chrome.storage.sync.get('HeaderLogos',function(items) {
		document.getElementById('HeaderLogos').value = items.HeaderLogos;
	});
}

///////////////////////////////////////
// Saves the Notification Time Value //
///////////////////////////////////////

function saveNotifyTimes() {
	var NotifyTimes = document.getElementById('NotifyTimes').value;
	chrome.storage.sync.set({NotifyTimes:NotifyTimes});
	message('Options saved.');
}

document.getElementById('NotifyTimes').addEventListener('change', saveNotifyTimes);

function loadNotifyTimes() {
	chrome.storage.sync.get('NotifyTimes',function(items) {
		document.getElementById('NotifyTimes').value = items.NotifyTimes;
	});
}


////////////////////////////////////////////////////////////////////////////////////////////
// Restores select box and checkbox state using the preferences stored in chrome.storage. //
////////////////////////////////////////////////////////////////////////////////////////////

function restore_options() {
	chrome.storage.sync.get({
		// Whole Site //
		enableAds: false,
		enableSocialButtons: true,
		enableCommentSections: true,
		enableCustomLogo: false,
		enableSlimHeader: false,
		enableNotifyUpdates: false,
		enableCustomScheme: false,
		enableFooter: true,

		// Home Page //
		enableWelcomeBox: true,
		enablePinnedBox: true,
		enableAltPinnedBox: false,
		enableBanner: true,
		enableAltRecentList: false,
		enableShowOnlyAiring: false,
		enableLastVideo: true,

		// Anime Page //
		enableFindinMAL: true,
		enableFindinKitsu: true,
		enableFindRedditDiscussions: true,
		enableDownloadAllLinks: false,

		// Bookmarks Page //
		relocateAiringBookmarks: false,

		// Video Page //
		// enableVideoPageAds: true,
		enableCustomPlayer: true,
		enablePlayerSwitchers: true,
		enableLightsOff: true,
		enableDownloadLinks: true,
		enableFileName: true,
		enableBookmarkLink: true,
		enableAutoAdvEp: false,
		enableKeyboardShortcuts: false,
		enablePlaybackRate: false,
		enableAutoFullscreen: false,
		enableAltVideoPage: false,
		enableAutoHD: false,
		enableAutoLQ: false,
		enablePauseOnSwitch: false,
		enableStretchFullscreenVid: false,
		enableTheaterMode: false,
		enableTheaterBacklight: false
	}, function(items) {

		// Whole Site //
		$('[name=\'enableAds\']').bootstrapSwitch('state', items.enableAds, true);
		$('[name=\'enableSocialButtons\']').bootstrapSwitch('state', items.enableSocialButtons, true);
		$('[name=\'enableCommentSections\']').bootstrapSwitch('state', items.enableCommentSections, true);
		$('[name=\'enableCustomLogo\']').bootstrapSwitch('state', items.enableCustomLogo, true);
		$('[name=\'enableSlimHeader\']').bootstrapSwitch('state', items.enableSlimHeader, true);
		$('[name=\'enableNotifyUpdates\']').bootstrapSwitch('state', items.enableNotifyUpdates, true);
		$('[name=\'enableCustomScheme\']').bootstrapSwitch('state', items.enableCustomScheme, true);
		$('[name=\'enableFooter\']').bootstrapSwitch('state', items.enableFooter, true);

		// Home Page //
		$('[name=\'enableWelcomeBox\']').bootstrapSwitch('state', items.enableWelcomeBox, true);
		$('[name=\'enablePinnedBox\']').bootstrapSwitch('state', items.enablePinnedBox, true);
		$('[name=\'enableAltPinnedBox\']').bootstrapSwitch('state', items.enableAltPinnedBox, true);
		$('[name=\'enableBanner\']').bootstrapSwitch('state', items.enableBanner, true);
		$('[name=\'enableAltRecentList\']').bootstrapSwitch('state', items.enableAltRecentList, true);
		$('[name=\'enableShowOnlyAiring\']').bootstrapSwitch('state', items.enableShowOnlyAiring, true);
		$('[name=\'enableLastVideo\']').bootstrapSwitch('state', items.enableLastVideo, true);

		// Anime Page //
		$('[name=\'enableFindinMAL\']').bootstrapSwitch('state', items.enableFindinMAL, true);
		$('[name=\'enableFindinKitsu\']').bootstrapSwitch('state', items.enableFindinKitsu, true);
		$('[name=\'enableFindRedditDiscussions\']').bootstrapSwitch('state', items.enableFindRedditDiscussions, true);
		$('[name=\'enableDownloadAllLinks\']').bootstrapSwitch('state', items.enableDownloadAllLinks, true);

		// Bookmarks Page //
		$('[name=\'relocateAiringBookmarks\']').bootstrapSwitch('state', items.relocateAiringBookmarks, true);

		// Video Page //
		// $("[name='enableVideoPageAds']").bootstrapSwitch('state', items.enableVideoPageAds, true);
		$('[name=\'enableCustomPlayer\']').bootstrapSwitch('state', items.enableCustomPlayer, true);
		$('[name=\'enableDownloadLinks\']').bootstrapSwitch('state', items.enableDownloadLinks, true);
		$('[name=\'enableLightsOff\']').bootstrapSwitch('state', items.enableLightsOff, true);
		$('[name=\'enablePlayerSwitchers\']').bootstrapSwitch('state', items.enablePlayerSwitchers, true);
		$('[name=\'enableFileName\']').bootstrapSwitch('state', items.enableFileName, true);
		$('[name=\'enableBookmarkLink\']').bootstrapSwitch('state', items.enableBookmarkLink, true);
		$('[name=\'enableAutoAdvEp\']').bootstrapSwitch('state', items.enableAutoAdvEp, true);
		$('[name=\'enableKeyboardShortcuts\']').bootstrapSwitch('state', items.enableKeyboardShortcuts, true);
		$('[name=\'enablePlaybackRate\']').bootstrapSwitch('state', items.enablePlaybackRate, true);
		$('[name=\'enableAutoFullscreen\']').bootstrapSwitch('state', items.enableAutoFullscreen, true);
		$('[name=\'enableAltVideoPage\']').bootstrapSwitch('state', items.enableAltVideoPage, true);
		$('[name=\'enableAutoHD\']').bootstrapSwitch('state', items.enableAutoHD, true);
		$('[name=\'enableAutoLQ\']').bootstrapSwitch('state', items.enableAutoLQ, true);
		$('[name=\'enablePauseOnSwitch\']').bootstrapSwitch('state', items.enablePauseOnSwitch, true);
		$('[name=\'enableStretchFullscreenVid\']').bootstrapSwitch('state', items.enableStretchFullscreenVid, true);
		$('[name=\'enableTheaterMode\']').bootstrapSwitch('state', items.enableTheaterMode, true);
		$('[name=\'enableTheaterBacklight\']').bootstrapSwitch('state', items.enableTheaterBacklight, true);

	});

	chrome.storage.local.get('enableMALAPI', function(items) {
		$('[name=\'enableMALAPI\']').bootstrapSwitch('state', items.enableMALAPI, true);
	});

	loadHeaderLogos();
	loadNotifyTimes();

}

/////////////////////////////////
// Clear all options function. //
/////////////////////////////////

$('#clearoptions').on('click', function(){
	$('#reset-confirm-modal').modal({backdrop:'static',keyboard:false}).one('click', '#reset-confirm-disable', function() {
		$('#reset-confirm-modal').modal('hide');
		clear_options();
	});
});

function clear_options() {
	chrome.storage.sync.set({
		// Whole Site //
		enableAds: false,
		enableSocialButtons: true,
		enableCommentSections: true,
		enableCustomLogo: false,
		enableSlimHeader: false,
		enableNotifyUpdates: false,
		enableCustomScheme: false,
		enableFooter: true,

		// Home Page //
		enableWelcomeBox: true,
		enablePinnedBox: true,
		enableAltPinnedBox: false,
		enableBanner: true,
		enableAltRecentList: false,
		enableShowOnlyAiring: false,
		enableLastVideo: true,

		// Anime Page //
		enableFindinMAL: true,
		enableFindinKitsu: true,
		enableFindRedditDiscussions: true,
		enableDownloadAllLinks: false,

		// Bookmarks Page //
		relocateAiringBookmarks: false,

		// Video Page //
		// enableVideoPageAds: true,
		enableCustomPlayer: true,
		enablePlayerSwitchers: true,
		enableLightsOff: true,
		enableDownloadLinks: true,
		enableFileName: true,
		enableBookmarkLink: true,
		enableAutoAdvEp: false,
		enableKeyboardShortcuts: false,
		enablePlaybackRate: false,
		enableAutoFullscreen: false,
		enableAutoHD: false,
		enableAutoLQ: false,
		enablePauseOnSwitch: false,
		enableStretchFullscreenVid: false,
		enableAltVideoPage: false,
		enableTheaterMode: false,
		enableTheaterBacklight: false
	}, function() {
		clearColorScheme();
		message('All settings are reset to default, refreshing the page...');
		setTimeout(function() {location.reload();}, 3000);
	});
}

function clearColorScheme(callback) {
	chrome.storage.sync.get(function(items) {
		var keys = Object.keys(items).filter(key => key.startsWith('cs_'));
		chrome.storage.sync.remove(keys, callback);
		$('.cs_picker').spectrum('set', '');
		$('#cs_background_image_picker').val('');
	});
}

//////////////////////////////////
// Displays Message when Called //
//////////////////////////////////

function message(msg) {
	toastr['success'](msg);
}

//////////////////////////////
// Restores Checkbox Values //
//////////////////////////////

$(document).ready(function(){
	restore_options();
});

//////////////////////////////////////////
// Backup/Restore Custom Scheme options //
//////////////////////////////////////////

$('#customscheme-backup-button').on('click', function() {
	backupCustomScheme();
});

$('#customscheme-restore-button').on('change', function() {
	restoreCustomScheme();
	$('#restoreFileNameCS').text($('#customscheme-restore-button').val().split('\\')[2]);
	$('#customscheme-restore-button').val('');
});

var storeVersion = 1; // This version will not be compatibile with the extension rewrite.

function backupCustomScheme() {
	chrome.storage.sync.get(function(items) {
		let scheme = {};
		for (let key in items) {
			if (key.startsWith('cs_'))
				scheme[key] = items[key];
		}
		var data = {
			NOTICE: 'UNLESS YOU KNOW WHAT YOU\'RE DOING, DO NOT MODIFY THE CONTENTS OF THIS FILE. DOING SO COULD CAUSE ISSUES WHEN RESTORING IT.',
			createdAt: new Date().toString(),
			createdTimestamp: Date.now(),
			type: 'customScheme',
			version: storeVersion,
			data: scheme
		};
		data = JSON.stringify(data, null, '\t');
		var temp = document.createElement('a');
		var blob = new Blob([data], { type: 'octet/stream' });
		temp.download = `customTheme_${new Date().toISOString()}.json`;
		temp.href = window.URL.createObjectURL(blob);
		temp.click();
	});
}

function restoreCustomScheme() {
	var file = event.target.files[0];
	document.querySelector('#customscheme-restore-button').value = '';
	if (!file) return;
	var fileReader = new FileReader();
	fileReader.onload = e => {
		var contents = e.target.result;
		try {
			contents = JSON.parse(contents);
		} catch (err) {
			// Probably an older file.
			return oldRestoreCustomScheme(file);
		}
		if (contents.type !== 'customScheme')
			return toastr.error('Incompatible data!');
		if (storeVersion < contents.version)
			return toastr.error('Backup file was created with a newer version of the extension and is not compatible!');
		var data = contents.data;
		let allowed = {};
		for (let key in data) {
			if (key.startsWith('cs_'))
				allowed[key] = data[key];
		}
		clearColorScheme(function() {
			chrome.storage.sync.set(allowed, function() {
				chrome.storage.sync.get(function(items) {
					if (items.cs_background) {
						if (items.cs_background == 'color') {
							$('#radio_cs_background_color').prop('checked', true);
							$('#cs_background_image').hide();
							$('#cs_background_color').show();
						} else if (items.cs_background == 'image') {
							$('#radio_cs_background_image').prop('checked', true);
							$('#cs_background_color').hide();
							$('#cs_background_image').show();
						}
					}
					if (items.cs_background_image) $('#cs_background_image_picker').val(items.cs_background_image);
					$('#customscheme-modal .cs_picker').each(function () {
						if (items[$(this).attr('data-storage-name')]) $('#' + $(this).attr('id')).spectrum('set', items[$(this).attr('data-storage-name')]);
					});
					toastr.success('Restore successful!');
				});
			});
		});
	};
	fileReader.readAsText(file);
}

function oldRestoreCustomScheme(file) {
	var type = /text.*/;
	if (!file) return;
	if (file.type.match(type)) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var contents = e.target.result;
			var CustomSchemeCheck = contents.indexOf('[CUSTOMSCHEMECHECK]') > -1;
			var CustomSchemeOptions = contents.substring(contents.indexOf('[START CUSTOM SCHEME]')+21,contents.indexOf('[END CUSTOM SCHEME]')).split(' || ');
			var CustomSchemeOptionsLength = contents.substring(contents.indexOf('[START CUSTOM SCHEME]')+21,contents.indexOf('[END CUSTOM SCHEME]')).length;
			// Didn't put much effort into this but this will check to see if this file contains [CustomSchemeCheck]. If it doesn't then it won't allow the file to be used. Simple way to prevent accidental changes.
			if (CustomSchemeCheck) {
				//console.log(CustomSchemeOptions);
				if (CustomSchemeOptionsLength > 0) {
					clearColorScheme(function() {
						chrome.storage.sync.set(JSON.parse('{'+CustomSchemeOptions.join(', ')+'}'), function() {
							chrome.storage.sync.get(function(items) {
								if (items.cs_background) {
									if (items.cs_background == 'color') {
										$('#radio_cs_background_color').prop('checked', true);
										$('#cs_background_image').hide();
										$('#cs_background_color').show();
									} else if (items.cs_background == 'image') {
										$('#radio_cs_background_image').prop('checked', true);
										$('#cs_background_color').hide();
										$('#cs_background_image').show();
									}
								}
								if (items.cs_background_image) $('#cs_background_image_picker').val(items.cs_background_image);
								$('#customscheme-modal .cs_picker').each(function() {
									if (items[$(this).attr('data-storage-name')]) $('#'+$(this).attr('id')).spectrum('set', items[$(this).attr('data-storage-name')]);
								});
							});
							toastr['success']('Custom Scheme Options Restored!');
						});
					});
				} else {
					toastr['error']('File does not contain anything to Restore!');
				}
			} else {
				toastr['error']('File is not a valid Backup File!');
			}
		};
		reader.readAsText(file);
	} else {
		toastr['error']('File Type must be plain text!');
	}
}

////////////////////////////////
// Backup/Restore Pinned List //
////////////////////////////////

$('#pinnedlist-modal-open').click(function() {
	loadPinnedList();
	$('#pinnedlist-modal').modal({backdrop:'static',keyboard:true}).one('click', '#pinnedlist-modal-close', function() {
		$('#pinnedlist-modal').modal('hide');
	});
});

$('#pinnedlist-backup-button').click(backupPinned);

$('#pinnedlist-restore-button').on('change', function() {
	$('#restoreFileNamePinned').text($('#pinnedlist-restore-button').val().split('\\')[2]);
	restorePinned();
});

function backupPinned() {
	chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListImg', 'PinnedListLW'], function (items) {
		var data = {
			NOTICE: 'UNLESS YOU KNOW WHAT YOU\'RE DOING, DO NOT MODIFY THE CONTENTS OF THIS FILE. DOING SO COULD CAUSE ISSUES WHEN RESTORING IT.',
			createdAt: new Date().toString(),
			createdTimestamp: Date.now(),
			type: 'pinnedAnime',
			version: storeVersion,
			data: {
				PinnedList: items.PinnedList || [],
				PinnedListURLs: items.PinnedListURLs || [],
				PinnedListImg: items.PinnedListImg || [],
				PinnedListLW: items.PinnedListLW || []
			}
		};
		data = JSON.stringify(data, null, '\t');
		var temp = document.createElement('a');
		var blob = new Blob([data], { type: 'octet/stream' });
		temp.download = `pinnedAnime_${new Date().toISOString()}.json`;
		temp.href = window.URL.createObjectURL(blob);
		temp.click();
	});
}

function restorePinned() {
	var file = event.target.files[0];
	document.querySelector('#pinnedlist-restore-button').value = '';
	if (!file) return;
	var fileReader = new FileReader();
	fileReader.onload = e => {
		var contents = e.target.result;
		try {
			contents = JSON.parse(contents);
		} catch (err) {
			// Probably an older file.
			return oldRestorePinned(file);
		}
		if (contents.type !== 'pinnedAnime')
			return toastr.error('Incompatible data!');
		if (storeVersion < contents.version)
			return toastr.error('Backup file was created with a newer version of the extension and is not compatible!');

		// Need to add check to make sure only the 4 main keys are allowed

		var data = contents.data;

		if (!data.PinnedList || !data.PinnedListURLs || data.PinnedList.length !== data.PinnedListURLs.length)
			return toastr.error('Missing/corrupt data!');

		data = {
			PinnedList: data.PinnedList,
			PinnedListURLs: data.PinnedListURLs,
			PinnedListLW: data.PinnedListLW || [],
			PinnedListImg: data.PinnedListImg || []
		};

		if (data.PinnedListLW.length !== data.PinnedList.length)
			data.PinnedListLW = new Array(data.PinnedList.length).fill(null);
		if (data.PinnedListImg.length !== data.PinnedList.length)
			data.PinnedListImg = new Array(data.PinnedList.length).fill(null);

		chrome.storage.sync.set(data);

		loadPinnedList();

		toastr.success('Restore successful!');

	};
	fileReader.readAsText(file);
}

// Keeping for compatibility
function oldRestorePinned(file) {
	var type = /text.*/;
	if (!file) return;
	if (file.type.match(type)) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var contents = e.target.result;
			var PinnedArrayCheck = contents.indexOf('[PINNEDLISTCHECK]') > -1;
			var PinnedNames = contents.substring(contents.indexOf('[START PINNED NAMES]') + 20, contents.indexOf('[END PINNED NAMES]')).split(',');
			var PinnedURLs = contents.substring(contents.indexOf('[START PINNED URLS]') + 19, contents.indexOf('[END PINNED URLS]')).split(',');
			var PinnedNamesLength = contents.substring(contents.indexOf('[START PINNED NAMES]') + 20, contents.indexOf('[END PINNED NAMES]')).length;
			var PinnedURLsLength = contents.substring(contents.indexOf('[START PINNED URLS]') + 19, contents.indexOf('[END PINNED URLS]')).length;
			var PinnedLW = new Array(PinnedNames.length).fill(null);
			var PinnedImg = new Array(PinnedNames.length).fill(null);
			// Didn't put much effort into this but this will check to see if this file contains [PINNEDLISTCHECK]. If it doesn't then it won't allow the file to be used. Simple way to prevent accidental changes.
			if (PinnedArrayCheck) {
				if (PinnedNamesLength > 0 && PinnedURLsLength > 0) {
					chrome.storage.sync.set({
						PinnedList: PinnedNames,
						PinnedListURLs: PinnedURLs,
						PinnedListLW: PinnedLW,
						PinnedListImg: PinnedImg
					}, function () {
						toastr['success']('Pinned List Restored!');
						loadPinnedList();
					});
				} else {
					toastr['error']('File does not contain anything to Restore!');
				}
			} else {
				toastr['error']('File is not a valid Backup File!');
			}
		};
		reader.readAsText(file);
	} else {
		toastr['error']('File Type must be plain text!');
	}
}

function getDate() {
	var currentTime = new Date();
	var month = currentTime.getMonth()+1;
	var date = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var seconds = currentTime.getSeconds();
	if (month.toString().length == 1) month = '0'+month;
	if (date.toString().length == 1) date = '0'+date;
	if (hours.toString().length == 1) hours = '0'+hours;
	if (minutes.toString().length == 1) minutes = '0'+minutes;
	if (seconds.toString().length == 1) seconds = '0'+seconds;
	return year.toString()+month.toString()+date.toString()+'_'+hours.toString()+minutes.toString()+seconds.toString();
}

//////////////////////
// Sort Pinned List //
//////////////////////

function loadPinnedList() {

	if ($('#PinnedList').sortable('instance')) $('#PinnedList').sortable('destroy');

	$('#PinnedList').empty();

	chrome.storage.sync.get(['PinnedList', 'PinnedListURLs', 'PinnedListLW', 'PinnedListImg'], function(items) {

		if (items.PinnedList == null || items.PinnedList.length == 0) {

			$('#PinnedList').html('You do not have any pinned Anime. To add Anime to this list, go to the Information page for any Anime you want and click on <span style="color:yellow;font-weight:bold">Pin to Homepage</span> or restore from a backed up file.');

		} else {

			var PinnedList = items.PinnedList;
			var PinnedListURLs = items.PinnedListURLs;
			var PinnedListLW = items.PinnedListLW;
			var PinnedListImg = items.PinnedListImg;

			for (var i in PinnedList) {

				$('#PinnedList').append(`
					<div>
						<img class="mi" style="width:12px;cursor:pointer" src="/images/delete.png">
						<a href="javascript:void(0)" class="PinnedLinks" id="${i}" data-href="${PinnedListURLs[i]}" data-img="${PinnedListImg[i]}">${PinnedList[i]}</a>
					</div>
				`);

				document.getElementById(i).dataset.lw = JSON.stringify(PinnedListLW[i]);

			}

			$('.PinnedLinks').click(function() {
				event.preventDefault();
			});

			$('.mi').click(function() {

				var Anime = $(this).next().text();
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

					$('#PinnedList a').each(function() {
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

///////////////////////
// Console for stuff //
///////////////////////

Mousetrap.bind('`', function() {
	$('#console-modal').modal({backdrop:'static',keyboard:true});
	consoleSubmit();
});

Mousetrap.bind('c', function() {
	$('#console-modal').modal({backdrop:'static',keyboard:true});
	consoleSubmit();
});

$('#console-modal').on('shown.bs.modal', function () {
	$('#console_text').focus();
	Mousetrap.bind('`', function() {
		$('#console-modal').modal('hide');
	});
	Mousetrap.bind('c', function() {
		$('#console-modal').modal('hide');
	});
});

$('#console-modal').on('hidden.bs.modal', function () {

	// Hides the Console Alert and Shows the Console Text Box in the case that the Modal was closed without pressing the close button //
	$('#console-form').show();
	$('#console-alert').hide();

	Mousetrap.bind('`', function() {
		$('#console-modal').modal({backdrop:'static',keyboard:true});
		consoleSubmit();
	});

	Mousetrap.bind('c', function() {
		$('#console-modal').modal({backdrop:'static',keyboard:true});
		consoleSubmit();
	});

});

$('#console-modal input').keypress(function(key) {
	if( key.charCode == 96) {
		event.preventDefault();
		$('#console-modal').modal('hide');
	}
});

$('#console-modal #console_text').autocomplete({
	source: [
		'chromeVersion',
		'disableAutoOpen',
		'enableAutoOpen',
		'getStore',
		'help',
		'mal',
		'reloadExt',
		'removeStore',
		'updatePinnedNames',
		'updatePinnedURLs',
		'viewWelcomeModal',
		'version'

	],
	appendTo: '#console-modal .modal-dialog',
	minLength: 0
});

$('#console-modal #console_text').focusin(function() {
	$(this).autocomplete( 'search', '' );
});

function consoleSubmit() {
	$('#console-modal form').unbind();
	$('#console-modal #console_text')
		.autocomplete('enable')
		.val('')
		.attr({'placeholder': '', 'type': 'text'});
	$('.temp').remove();
	$('#console-modal form').submit(function(event) {
		var text = $('#console_text').val().toUpperCase();
		switch (text) {
		case 'HELP':
			consoleAlert(`
					<div style="text-align: left">
						<div><span class="select">chromeVersion:</span> Copies the chrome version to the clipboard.</div>
						<div><span class="select">disableAutoOpen:</span> Disables the extension from automatically opening the Options Page on update.</div>
						<div><span class="select">enableAutoOpen:</span> Enables the extension to automatically open the Options Page on update.</div>
						<div><span class="select">fixStorage:</span> Fix for those affected by an error that prevents the Default Values from being set on first install.</div>
						<div><span class="select">getStore:</span> Retrives the value for the inputed storage item.*</div>
						<div><span class="select">help:</span> Displays this help box.</div>
						<div><span class="select">removeStore:</span> Removes the inputed storage item from the storage.*</div>
						<div><span class="select">updatePinnedNames:</span> Allows manual updating of Pinned List Names.*</div>
						<div><span class="select">updatePinnedURLs:</span> Allows manual updating of Pinned List URLs.*</div>
						<div><span class="select">viewWelcomeModal:</span> Displays the Modal that appears on First Install.</div>
						<div><span class="select">version:</span> Copies the current extension version to the clipboard.</div>
					</div>
					<div>*Not for normal use.</div>
				`);
			break;
		case 'ENABLESCRAPEMODE':
			chrome.storage.local.set({enableScrapeMode: true});
			$('#console-modal').modal('hide');
			break;
		case 'DISABLESCRAPEMODE':
			chrome.storage.local.set({enableScrapeMode: false});
			$('#console-modal').modal('hide');
			break;
		case 'CHROMEVERSION':
			copy('Chrome Version: '+window.navigator.userAgent);
			consoleAlert('Chrome Version has been copied to your clipboard.');
			break;
		case 'VERSION':
			chrome.storage.local.get('version', function(items) {
				copy('Extension Version: '+items.version);
				consoleAlert('Extension Version has been copied to your clipboard.');
			});
			break;
		case 'DISABLEAUTOOPEN':
			chrome.storage.local.set({openOptionsOnUpdate: false});
			consoleAlert('Options Page will no longer open when the extension is updated.');
			break;
		case 'ENABLEAUTOOPEN':
			chrome.storage.local.set({openOptionsOnUpdate: true});
			consoleAlert('Options Page will now open when the extension is updated.');
			break;
		case 'UPDATEPINNEDNAMES':
			$('#console-modal #console_text').autocomplete('disable');
			var pinnednames_dialog = window.confirm('WARNING! Manually Changing your Pinned List Names is not advised unless I (the extension author) told you to do so or you know what you\'re doing. Click OK to proceed or Cancel to go back.');
			if (pinnednames_dialog == true) {
				$('#console_text').val('');
				$('#console_text').attr('placeholder', 'Enter Pinned List Names Array.');
				$('#console-modal form').unbind();
				$('#console-modal form').submit(function(event) {
					var cPinnedNamesArray = $('#console_text').val();
					if (isJson(cPinnedNamesArray) == true) {
						var cPinnedNamesArray = JSON.parse(cPinnedNamesArray);
						chrome.storage.sync.set({PinnedList: cPinnedNamesArray});
						consoleAlert('Pinned List Names Updated.');
					} else {
						shake('#console-modal');
					}
					event.preventDefault();
				});

			} else {
				$('#console_text').val('');
				$('#console-modal').modal('hide');
			}
			break;
		case 'UPDATEPINNEDURLS':
			$('#console-modal #console_text').autocomplete('disable');
			var pinnednames_dialog = window.confirm('WARNING! Manually Changing your Pinned List URLs is not advised unless I (the extension author) told you to do so or you know what you\'re doing. Click OK to proceed or Cancel to go back.');
			if (pinnednames_dialog == true) {
				$('#console_text').val('');
				$('#console_text').attr('placeholder', 'Enter Pinned List URLs Array.');
				$('#console-modal form').unbind();
				$('#console-modal form').submit(function(event) {
					var cPinnedURLsArray = $('#console_text').val();
					if (isJson(cPinnedURLsArray) == true) {
						cPinnedURLsArray = JSON.parse(cPinnedURLsArray);
						chrome.storage.sync.set({PinnedListURLs: cPinnedURLsArray});
						consoleAlert('Pinned List URLs Updated.');
					} else {
						shake('#console-modal');
					}
					event.preventDefault();
				});
			} else {
				$('#console_text').val('');
				$('#console-modal').modal('hide');
			}
			break;
		case 'VIEWWELCOMEMODAL':
			$('#console-modal').modal('hide');
			$('#first-install-modal').modal({backdrop:'static',keyboard:false});
			break;
		case 'REMOVESTORE':
			$('#console-modal #console_text').autocomplete('disable');
			$('#console_text').val('');
			$('#console-modal form').unbind();
			$('#console-modal form').submit(function(event) {
				var storagename = $('#console_text').val();
				chrome.storage.sync.remove(storagename);
				$('#console_text').val('');
				$('#console-modal').modal('hide');
				toastr['success']('Storage Name Removed');
				event.preventDefault();
			});
			break;
		case 'GETSTORE':
			$('#console-modal #console_text').autocomplete('disable');
			$('#console_text').val('');
			$('#console-modal form').unbind();
			$('#console-modal form').submit(function(event) {
				var storagename = $('#console_text').val();
				chrome.storage.sync.get(storagename, function(items) {
					consoleAlert(items[Object.keys(items)[0]]);
				});
				event.preventDefault();
			});
			break;
			// MAL Stuff //
		case 'MAL':
			doMALModal();
			$('#console-modal').modal('hide');
			break;

		case 'RELOADEXT':
			chrome.runtime.reload();
			break;
		case 'FIXSTORAGE':
			clear_options();
			break;

			// Shake the box on incorrect command //
		default:
			shake('#console-modal');
			$('#console_text').val('');
		}
		event.preventDefault();
	});
}

///////////////////////
// MyAnimeList Stuff //
///////////////////////

$('#malOptions').click(doMALModal);

function doMALModal() {

	$('#mal-modal').modal({backdrop:'static',keyboard:true});

	chrome.storage.local.get('MALLoggedIn', function(MAL) {
		if (MAL.MALLoggedIn == true) {
			$('#MALLoginStatus').html(`Logged in as <span class="select">${chrome.extension.getBackgroundPage().malAuth.user}</span>`);
			$('#MALSubmit').text('Logout').data('isLoggedIn', true);
		} else {
			$('#MALLoginStatus').text('Not Logged In');
			$('#MALSubmit').text('Login').data('isLoggedIn', false);
		}
	});

	$(document).on('click', '#MALSubmit', function() {

		if (!$(this).data('isLoggedIn')) {

			var user = $('#textMALUser').val();
			var pass = $('#textMALPass').val();

			chrome.runtime.sendMessage({
				MALv2: {
					type: 0,
					action: 1,
					auth: {user, pass}
				}
			}, function(response) {

				if (response.success) {
					$('#MALLoginStatus').html(`Logged in as <span class="select">${chrome.extension.getBackgroundPage().malAuth.user}</span>`);
					$('#MALSubmit').text('Logout').data('isLoggedIn', true);
					$('.loginField').val('');
					$('#MALSubmitStatus').text('Login Successful');
					setTimeout(() => $('#MALSubmitStatus').text(''), 3000);
				} else {
					$('#MALSubmitStatus').text('Login Failed - ' + response.data);
					setTimeout(() => $('#MALSubmitStatus').text(''), 3000);
				}

			});

		} else {

			chrome.runtime.sendMessage({
				MALv2: {type: 0, action: 0}
			}, function(response) {

				if (!response.success) {
					$('#MALLoginStatus').text('Not Logged In');
					$('#MALSubmit').text('Login').data('isLoggedIn', false);
					$('#MALSubmitStatus').text('Logout Successful');
					setTimeout(() => $('#MALSubmitStatus').text(''), 3000);
				}

			});

		}

	});
}

//////////////////////
// Random Functions //
//////////////////////

function shake(id) {
	$(id).css('transition', '0.2s');
	$(id).css('left', '50px');
	setTimeout(function() {
		$(id).css('left', '-50px');
		setTimeout(function() {
			$(id).css('left', '50px');
			setTimeout(function() {
				$(id).css('left', '-50px');
				setTimeout(function() {
					$(id).css('left', '50px');
					setTimeout(function() {
						$(id).css('left', '');
						$(id).css('transition', '');
					},75);
				},75);
			},75);
		},75);
	},75);
}

function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function copy(text) {
	$('textarea').show();
	$('textarea').text(text);
	$('textarea').select();
	document.execCommand('copy');
	$('textarea').hide();
	$('textarea').text('');
}

function consoleAlert(text) {
	$('#console-modal .modal-dialog').css('width', '655px');
	$('#console-form').hide();
	$('#console-alert').show();
	$('#console-alert span').html(text);
	$('#console-alert button').focus();
	$('#console-alert button').one('click', function() {
		$('#console-modal').modal('hide');
	});
	$('#console-modal').one('hidden.bs.modal', function() {
		$('#console-alert span').html('');
		$('#console-modal .modal-dialog').css('width', '310px');
	});
}

switch(getUrlParameter('open')) {
case 'mal':
	doMALModal();
	break;
case 'extpage':
	chrome.tabs.create({url: 'chrome://extensions/'});
	break;
case 'changelog':
	window.location = $('#version').attr('href');
	break;
case 'info':
	window.location = $('#info').attr('href');
	break;
}

function highlight(a) {
	var element = $('label[for='+a+']');
	$('body').animate({
		scrollTop: $(element).offset().top - 100
	}, 1000, function() {
		$(element).css({
			'-webkit-transition': 'text-shadow 0.8s ease-in-out',
			'text-shadow': '0px 0px 35px white'
		}).animate({
			'color': 'yellow'
		}, 800, function() {
			setTimeout(function() {
				$(element).css('text-shadow', 'inherit').animate({
					'color': 'inherit',
					'text-shadow': 'inherit'
				}, 800);
			}, 1000);
		});
	});
}

if (getUrlParameter('goto')) {
	highlight( getUrlParameter('goto') );
}
