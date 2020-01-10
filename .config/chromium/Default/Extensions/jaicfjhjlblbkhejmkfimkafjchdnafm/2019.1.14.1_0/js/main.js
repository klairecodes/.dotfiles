/* == All of this shit is being rewritten == */

if (window.parent !== window) throw "stop";

var logStyleSolo = 'background: #35495e; padding: 1px; border-radius: 3px';
var logStyleBeginning = 'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px';
var logStyleMiddle = 'background: darkcyan; padding: 1px; color: #fff';
var logStyleEnd = 'background: #287594; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff';

$(() => {

	/* == Used to theme the site for certain events or to hotfix an issue without having to push an update == */
	chrome.runtime.sendMessage({ request: 'https://ke.pilar.moe/api/v2/external' }, function(data) {
		if (!data.success) return;
		$('<div style="display:none" id="efka-external">').html(data.data).appendTo('body');
	});

	$('head').inject('inline-script', function() {
		window.L9J2 = null; // Overwriting something important to prevent the ad script from properly working
	});

});

/////////////////////////////////
// REMOVE SOCIAL MEIDA BUTTONS //
/////////////////////////////////

chrome.storage.sync.get('enableSocialButtons', function(items) {

	if (items.enableSocialButtons == false) {

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/hideSocialMedia.css')}" rel="stylesheet" type="text/css">`);

		var atcounter = 0; var atint = setInterval(function() {
			$('head script[src*="addthis"], head script[src*="plusone"]').remove();
			atcounter++;
			if (atcounter > 100) clearInterval(atint);
		}, 50);

		$(document).ready(function() {
			$('[id*="plusone"], [class*="plusone"], [class*="addthis"], #_atssh').remove();
			$('[src$="icon_rss.png"]').closest('div').remove();
			$('div:contains("Like me please")', '#rightside').remove();
		});

	}

});

/////////////////////////
// CHANGE HEADER LOGOS //
/////////////////////////

chrome.storage.sync.get(['enableCustomLogo', 'HeaderLogos', 'userlogo', 'userlogoPosLeft', 'userlogoPosTop', 'userlogoSize'], function(items) {

	if (items.enableCustomLogo == true) {

		if (items.HeaderLogos === 'custom') {

			var userlogoPosLeft = items.userlogoPosLeft ? items.userlogoPosLeft : '100';
			var userlogoPosTop = items.userlogoPosTop ? items.userlogoPosTop : '100';
			var userlogoSize = items.userlogoSize ? items.userlogoSize : '100';

			$('head').append(`<style>
				#head .logo { width: 350px !important; }
				#head > h1 {
					background-image: url(${chrome.runtime.getURL('images/logos/logo-user-template.png')}), url(${items.userlogo}) !important;
					background-position: center left, ${userlogoPosLeft}% ${userlogoPosTop}% !important;
					background-color: transparent !important;
					background-repeat: no-repeat !important;
					background-size: auto, auto ${userlogoSize}% !important;
				}
			</style>`);

		} else {

			var headerLogoURL = chrome.extension.getURL(`images/logos/${items.HeaderLogos}.png`);

			$('head').append(`<style>
				#head > h1 { background: transparent url(${headerLogoURL}) no-repeat !important; }
			</style>`);

		}

	}

});

////////////////////
// CUSTOM SCHEME //
///////////////////

var styles = '';
function styleHead(style) {
	styles += '\n' + style.trim().replace(/	/g, '');
	$('#efka_custom_styles').remove();
	$('head').after(`<style id="efka_custom_styles">${styles}</style>`);
}

// This is a huge mess and I completely regret doing this. This probably won't ever be updated as it is a pain to manage. Please do not ask why I did this. I don't know myself //
chrome.storage.sync.get('enableCustomScheme', function(items) {

	if (items.enableCustomScheme == true) {

		doCustomScheme(); // Load Custom Scheme on page load

		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (var key in changes) {
				if (key.indexOf('cs_') === 0) {
					console.log(changes[key]);
					styles = '';
					doCustomScheme();
					break; // Only want this to happen once
				} else if (key == 'enableCustomScheme') {
					if (changes[key].newValue == true) {
						styles = '';
						doCustomScheme();
					} else {
						$('#efka_custom_styles').remove();
					}
				}
			}
		});

		function doCustomScheme() {

			chrome.storage.sync.get(function(items) {

				/* == Custom Scheme Background == */

				if (items.cs_background == "color") {

					if (items.cs_background_color)
						styleHead(`html, #containerRoot { background: ${items.cs_background_color} !important; }`);

				} else if (items.cs_background == "image") {

					if (items.cs_background_image) {

						var backgroundImageColor = items.cs_background_image_color || '#161616';
						var darkOverlayOpacity = items.cs_background_overlay_opacity || 0;
						styleHead(`html, body, #containerRoot { background: linear-gradient(rgba(0, 0, 0, ${darkOverlayOpacity}), rgba(0, 0, 0, ${darkOverlayOpacity})), url(${items.cs_background_image}) ${backgroundImageColor}; background-size: cover; background-attachment: fixed; background-repeat: no-repeat; }`);

						var backgroundImageX = items.cs_background_image_position_x || 'center';
						var backgroundImageY = items.cs_background_image_position_y || 'center';
						styleHead(`html, body, #containerRoot { background-position: ${backgroundImageX} ${backgroundImageY}; }`);

					}

				}

				if (items.cs_transition_background_color)
					styleHead(`.banner, .welcome-box, #PinnedBox, #leftside .bigBarContainer, #subcontent, .rightBox { transition: 0.5s; }`);
				if (items.cs_transition_background_color)
					styleHead(`.banner:hover, .welcome-box:hover, #PinnedBox:hover, #leftside .bigBarContainer:hover, #subcontent:hover, .rightBox:hover { background: ${items.cs_transition_background_color} !important; }`);

				/* == User Top Box == */

				if (items.cs_topholderbox_background_color)
					styleHead(`#topHolderBox { background: ${items.cs_topholderbox_background_color} !important; }`);
				if (items.cs_topholderbox_text_color)
					styleHead(`#topHolderBox * { color: ${items.cs_topholderbox_text_color} !important; }`),
					styleHead(`#topHolderBox a { color: #EEE !important; }`);
				if (items.cs_topholderbox_link_color)
					styleHead(`#topHolderBox a { color: ${items.cs_topholderbox_link_color} !important; }`);
				if (items.cs_topholderbox_link_hover_color)
					styleHead(`#topHolderBox a:hover { color: ${items.cs_topholderbox_link_hover_color} !important; }`);

				/* == Navbar == */

				if (items.cs_navbar_background_color)
					styleHead(`#navbar, #search:after { background: ${items.cs_navbar_background_color} !important; }`);

				if (items.cs_navbar_tab_current_background_color)
					styleHead(`#navbar #currentTab { background: ${items.cs_navbar_tab_current_background_color} url(${chrome.runtime.getURL('/images/button_overlay.png')}) !important; border-radius: 6px 6px 0 0; }`);
				if (items.cs_navbar_tab_current_text_color)
					styleHead(`#navbar a#currentTab { color: ${items.cs_navbar_tab_current_text_color} !important; }`);
				if (items.cs_navbar_tab_other_background_color)
					styleHead(`#navbar a { background: ${items.cs_navbar_tab_other_background_color} url(${chrome.runtime.getURL('/images/button_overlay.png')}) !important; border-radius: 6px 6px 0 0; }`);
				if (items.cs_navbar_tab_other_text_color)
					styleHead(`#navbar a { color: ${items.cs_navbar_tab_other_text_color} !important; }`);
				if (items.cs_navbar_tab_hover_background_color)
					styleHead(`#navbar a:hover { background: ${items.cs_navbar_tab_hover_background_color} url(${chrome.runtime.getURL('/images/button_overlay.png')}) !important; border-radius: 6px 6px 0 0; }`);

				if (items.cs_navbar_sub_background_color)
					styleHead(`#navsubbar { background: ${items.cs_navbar_sub_background_color} !important; }`);
				if (items.cs_navbar_sub_link_color)
					styleHead(`#navsubbar a { color: ${items.cs_navbar_sub_link_color} !important; }`);
				if (items.cs_navbar_sub_link_hover_color)
					styleHead(`#navsubbar a:hover { color: ${items.cs_navbar_sub_link_hover_color} !important; }`);

				/* == Footer == */

				if (items.cs_footer_background_color)
					styleHead(`#footer { background: ${items.cs_footer_background_color} !important; }`);
				if (items.cs_footer_text_color)
					styleHead(`#footer * { color: ${items.cs_footer_text_color} !important; }`),
					styleHead(`#footer a { color: #cccccc !important; } #footer a:hover { color: #ff9600 !important; }`);
				if (items.cs_footer_link_color)
					styleHead(`#footer a { color: ${items.cs_footer_link_color} !important; }`);
				if (items.cs_footer_link_hover_color)
					styleHead(`#footer a:hover { color: ${items.cs_footer_link_hover_color} !important; }`);

				if ( /kissanime.ru\/$/.test(window.location.href) == true ) { // Homepage Only

					/* == Homepage Banner == */

					if (items.cs_banner_background_color)
						styleHead(`.banner, #cycleAlerts { background: ${items.cs_banner_background_color} !important; border: 1px solid ${items.cs_banner_background_color} !important; }`);
					if (items.cs_banner_text_color)
						styleHead(`.banner *, #cycleAlerts { color: ${items.cs_banner_text_color} !important; } .banner a { color: #d5f406 !important; } .banner a:hover { color: #648f06 !important; }`);
					if (items.cs_banner_link_color)
						styleHead(`.banner a, #cycleAlerts a { color: ${items.cs_banner_link_color} !important; }`);
					if (items.cs_banner_link_hover_color)
						styleHead(`.banner a:hover, #cycleAlerts a:hover { color: ${items.cs_banner_link_hover_color} !important; }`);

					/* == Welcome Box == */

					/*
						== ToDo ==
						- Allow users to change the color of the airing statuses (Nya, Airing, Completed)
					*/

					if (items.cs_welcomebox_titlebar_background_color)
						styleHead(`.welcome-box-title { background: ${items.cs_welcomebox_titlebar_background_color} !important; }`),
						styleHead(`.welcome-box-content .arrow-general { display: none !important; }`),
						styleHead(`.welcome-box-content:before { display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_welcomebox_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""; }`)
					if (items.cs_welcomebox_titlebar_text_color)
						styleHead(`.welcome-box-title { color: ${items.cs_welcomebox_titlebar_text_color} !important; }`);
					if (items.cs_welcomebox_background_color)
						styleHead(`.welcome-box { background: ${items.cs_welcomebox_background_color} !important; border: 1px solid ${items.cs_welcomebox_background_color} !important; }`),
						styleHead(`.welcome-box-content { background: none !important }`);
					if (items.cs_welcomebox_text_color)
						styleHead(`.welcome-box-content * { color: ${items.cs_welcomebox_text_color}; }`),
						styleHead(`.welcome-box-content a { color: #d5f406 !important; }`),
						styleHead(`.welcome-box-content a:hover { color: #648f06 !important; }`);
					if (items.cs_welcomebox_link_color)
						styleHead(`.welcome-box-content a { color: ${items.cs_welcomebox_link_color} !important; }`),
						styleHead(`.welcome-box-content a:hover { color: #648f06 !important; }`);
					if (items.cs_welcomebox_link_hover_color)
						styleHead(`.welcome-box-content a:hover { color: ${items.cs_welcomebox_link_hover_color} !important; }`);

					/* == Pinned Box == */

					if (items.cs_pinnedbox_titlebar_background_color)
						styleHead(`#PinnedBoxTitle { background: ${items.cs_pinnedbox_titlebar_background_color} !important; }`),
						styleHead(`#PinnedBoxContent .arrow-general { display:none !important; }`),
						styleHead(`#PinnedBoxContent:before { display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_pinnedbox_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""; }`);
					if (items.cs_pinnedbox_titlebar_text_color)
						styleHead(`#PinnedBoxTitle { color: ${items.cs_pinnedbox_titlebar_text_color} !important; }`);

					if (items.cs_pinnedbox_background_color) styleHead(`#PinnedBox {background: ${items.cs_pinnedbox_background_color} !important; border: 1px solid ${items.cs_pinnedbox_background_color} !important} #PinnedBoxContent {background: none !important}`);
					if (items.cs_pinnedbox_link_color) styleHead(`#PinnedBoxContent a {color: ${items.cs_pinnedbox_link_color} !important} #PinnedBoxContent a:hover {color: #648f06 !important} #PinnedBoxContent .PinnedLatestEpisode {color: skyblue !important} #PinnedBoxContent .PinnedLatestEpisode:visited {color: #888888 !important}`);
					if (items.cs_pinnedbox_link_hover_color) styleHead(`#PinnedBoxContent a:hover, #PinnedBoxContent .PinnedLatestEpisode:hover {color: ${items.cs_pinnedbox_link_hover_color} !important}`);

					// Latest Update //
					if (items.cs_latestupdate_titlebar_background_color) styleHead(`#leftside .barTitle {background: ${items.cs_latestupdate_titlebar_background_color} !important} #leftside .arrow-general {display:none !important} #leftside .barContent:before, #leftside #recentUpdates:before {display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_latestupdate_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}`);
					if (items.cs_latestupdate_titlebar_text_color) styleHead(`#leftside .barTitle .scrollable_title {color: ${items.cs_latestupdate_titlebar_text_color} !important}`);

					if (items.cs_latestupdate_background_color) styleHead(`#leftside .bigBarContainer {background: ${items.cs_latestupdate_background_color} !important; border: 1px solid ${items.cs_latestupdate_background_color} !important} #leftside .barContent, #leftside #recentUpdates {background: none !important} #leftside #recentUpdates .listing tr.odd {background: none repeat scroll 0 0 ${items.cs_pinnedbox_background_color} !important}`);
					if (items.cs_latestupdate_background_color && items.enableAltRecentList) styleHead(`.listing tr:nth-child(odd) td {background: none repeat scroll 0 0 ${items.cs_pinnedbox_background_color} !important}`);
					if (items.cs_contentboxes_background_hover_color && items.enableAltRecentList) styleHead(`.listing tr:hover td {background: none repeat scroll 0 0 ${items.cs_contentboxes_background_hover_color} !important}`);
					if (items.cs_latestupdate_text_color) styleHead(`#leftside .barContent, #leftside #recentUpdates {color: ${items.cs_latestupdate_text_color} !important}`);
					if (items.cs_latestupdate_link_color) styleHead(`#leftside .barContent a, #leftside #recentUpdates a {color: ${items.cs_latestupdate_link_color} !important} #leftside .barContent a:hover, #leftside #recentUpdates a:hover {color: #648f06 !important}`);
					if (items.cs_latestupdate_link_hover_color) styleHead(`#leftside .barContent a:hover, #leftside #recentUpdates a:hover {color: ${items.cs_latestupdate_link_hover_color} !important}`);
					// Right Boxes //
					if (items.cs_rightboxes_titlebar_background_color) styleHead(`.rightBox .barTitle {background: ${items.cs_rightboxes_titlebar_background_color} !important} .rightBox .barContent .arrow-general {display:none !important} .rightBox .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_rightboxes_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}`);
					if (items.cs_rightboxes_titlebar_text_color) styleHead(`.rightBox .barTitle {color: ${items.cs_rightboxes_titlebar_text_color} !important}`);

					if (items.cs_rightboxes_background_color) styleHead(`.rightBox {background: ${items.cs_rightboxes_background_color} !important; border: 1px solid ${items.cs_rightboxes_background_color} !important} .rightBox .barContent {background: none !important}`);
					if (items.cs_rightboxes_link_color) styleHead(`.rightBox .barContent a {color: ${items.cs_rightboxes_link_color} !important} .rightBox .barContent a:hover {color: #648f06 !important} a.textDark {color: #888888 !important}`);
					if (items.cs_rightboxes_link_hover_color) styleHead(`.rightBox .barContent a:hover {color: ${items.cs_rightboxes_link_hover_color} !important}`);
					// SubContent //
					if (items.cs_subcontent_tab_current_background_color) styleHead(`#tabmenucontainer .tabactive {background: ${items.cs_subcontent_tab_current_background_color} url(${chrome.runtime.getURL('/images/button_overlay2.png')}) !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}`);
					if (items.cs_subcontent_tab_current_text_color) styleHead(`#tabmenucontainer .tabactive {color: ${items.cs_subcontent_tab_current_text_color} !important}`);
					if (items.cs_subcontent_tab_other_background_color) styleHead(`#tabmenucontainer a {background: ${items.cs_subcontent_tab_other_background_color} url(${chrome.runtime.getURL('/images/button_overlay2.png')}) !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}`);
					if (items.cs_subcontent_tab_other_text_color) styleHead(`#tabmenucontainer a {color: ${items.cs_subcontent_tab_other_text_color} !important}`);
					if (items.cs_subcontent_tab_hover_background_color) styleHead(`#tabmenucontainer a:hover {background: ${items.cs_subcontent_tab_hover_background_color} url(${chrome.runtime.getURL('/images/button_overlay2.png')}) !important; border-radius: 6px 6px 0 0; width: 123px !important; margin-right: 2px !important}`);

					if (items.cs_subcontent_content_background_color) styleHead(`#subcontent div div {background: ${items.cs_subcontent_content_background_color} !important} #subcontent div div div {background: none !important} #subcontent {background: none !important; border: 1px solid ${items.cs_subcontent_content_background_color} !important}`);
					if (items.cs_subcontent_content_background_color2) styleHead(`#subcontent div div.blue {background: ${items.cs_subcontent_content_background_color2} !important}  #subcontent div div.blue div {background: none !important}`);
					if (items.cs_subcontent_content_text_color) styleHead(`#subcontent .info {color: ${items.cs_subcontent_content_text_color} !important}`);
					if (items.cs_subcontent_content_link_color) styleHead(`#subcontent a, #subcontent .title {color: ${items.cs_subcontent_content_link_color} !important} #subcontent a:hover, #subcontent .title:hover {color: #648f06 !important}`);
					if (items.cs_subcontent_content_link_hover_color) styleHead(`#subcontent a:hover, #subcontent .title:hover {color: ${items.cs_subcontent_content_link_hover_color} !important}`);
				}
				if ( /kissanime.ru\/$/.test(window.location.href) === false ) { // For everything else that is not on the homepage. I'm to lazy to add options to theme everything individually //
					// Content Boxes //
					if (items.cs_contentboxes_titlebar_background_color) styleHead(`#leftside .barTitle, .rightBox .barTitle {background: ${items.cs_contentboxes_titlebar_background_color} !important} .barContent .arrow-general {display:none !important} #leftside .barContent:before, .rightBox .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_contentboxes_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}`);
					if (items.cs_contentboxes_titlebar_text_color) styleHead(`.barTitle {color: ${items.cs_contentboxes_titlebar_text_color} !important}`);

					if (items.cs_contentboxes_background_color) styleHead(`#leftside .bigBarContainer, .rightBox, #leftside .bigBarContainer .listing tr.odd, #divComments {background: ${items.cs_contentboxes_background_color} !important; border: 1px solid ${items.cs_contentboxes_background_color} !important} #leftside .barContent, .rightBox .barContent, .bigBarContainer .alphabet {background: none !important}`);
					if (items.cs_contentboxes_background_hover_color) styleHead(`.listing tr:hover td {background: ${items.cs_contentboxes_background_hover_color} !important}`);
					if (items.cs_contentboxes_text_color) styleHead(`#leftside .barContent, .rightBox .barContent {color: ${items.cs_contentboxes_text_color} !important}`);
					if (items.cs_contentboxes_link_color) styleHead(`#leftside .barContent a, .rightBox .barContent a {color: ${items.cs_contentboxes_link_color} !important} #leftside .barContent a:hover, .rightBox .barContent a:hover {color: #648f06 !important} #leftside .listing a:visited, .episodeVisited {color: #648f06 !important}`);
					if (items.cs_contentboxes_link_visited_color) styleHead(`#leftside .listing a:visited, .episodeVisited {color: ${items.cs_contentboxes_link_visited_color} !important}`);
					if (items.cs_contentboxes_link_hover_color) styleHead(`#leftside .barContent a:hover, .rightBox .barContent a:hover {color: ${items.cs_contentboxes_link_hover_color} !important}`);

					if ( /kissanime.ru\/BookmarkList$/.test(window.location.href) == true || window.location.href.indexOf("kissanime.ru/MyList/") > -1 ) {
						if (items.cs_contentboxes_titlebar_background_color) styleHead(`.barTitle {background: ${items.cs_contentboxes_titlebar_background_color} !important} .barContent .arrow-general {display:none !important} .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_contentboxes_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}`);
						if (items.cs_contentboxes_titlebar_text_color) styleHead(`.barTitle {color: ${items.cs_contentboxes_titlebar_text_color} !important}`);

						if (items.cs_contentboxes_background_color) styleHead(`.bigBarContainer, .listing tr:nth-child(odd) {background: ${items.cs_contentboxes_background_color} !important; border: 1px solid ${items.cs_contentboxes_background_color} !important} .barContent {background: none !important}`);
						if (items.cs_contentboxes_text_color) styleHead(`.barContent {color: ${items.cs_contentboxes_text_color} !important}`);
						if (items.cs_contentboxes_link_color) styleHead(`.barContent a {color: ${items.cs_contentboxes_link_color} !important} .barContent a:hover {color: #648f06 !important} .listing tr td:nth-child(2) a:visited {color: #648f06 !important}`);
						if (items.cs_contentboxes_link_visited_color) styleHead(`.listing a:visited, .episodeVisited {color: ${items.cs_contentboxes_link_visited_color} !important}`);
						if (items.cs_contentboxes_link_hover_color) styleHead(`.barContent a:hover {color: ${items.cs_contentboxes_link_hover_color} !important}`);
					}

					if (/kissanime.ru\/Message\/ReportError$/.test(window.location.href) == true) {
						if (items.cs_contentboxes_titlebar_background_color) styleHead(`.barTitle {background: ${items.cs_contentboxes_titlebar_background_color} !important} .barContent .arrow-general {display:none !important} .barContent:before {display: block; width: 0; height: 0; border-bottom: 12px solid ${items.cs_contentboxes_titlebar_background_color}; border-left: 12px solid transparent; top: -18px; position: relative; transform: rotate(45deg); content: ""}`);
						if (items.cs_contentboxes_titlebar_text_color) styleHead(`.barTitle {color: ${items.cs_contentboxes_titlebar_text_color} !important}`);

						if (items.cs_contentboxes_background_color) styleHead(`.bigBarContainer {background: ${items.cs_contentboxes_background_color} !important; border: 1px solid ${items.cs_contentboxes_background_color} !important} .barContent {background: none !important}`);
						if (items.cs_contentboxes_text_color) styleHead(`.barContent {color: ${items.cs_contentboxes_text_color} !important}`);
						if (items.cs_contentboxes_link_color) styleHead(`.barContent a {color: ${items.cs_contentboxes_link_color} !important} #leftside .barContent a:hover, .rightBox .barContent a:hover {color: #648f06 !important}`);
						if (items.cs_contentboxes_link_hover_color) styleHead(`.barContent a:hover {color: ${items.cs_contentboxes_link_hover_color} !important}`);
					}

				}

				/* == Video Page == */

				$(document).ready(function() {
					if ($('#divContentVideo').length) {
						if (items.cs_videopage_container_background_color)
							styleHead(`.bigBarContainer, .barContent { background: ${items.cs_videopage_container_background_color} !important; border: 1px solid ${items.cs_videopage_container_background_color} !important; }`);
						if (items.cs_videopage_container_text_color)
							styleHead(`.barContent { color: ${items.cs_videopage_container_text_color} !important; }`);
						if (items.cs_videopage_container_link_color)
							styleHead(`.barContent a { color: ${items.cs_videopage_container_link_color} !important; }`);
						if (items.cs_videopage_container_link_hover_color)
							styleHead(`.barContent a:hover { color: ${items.cs_videopage_container_link_hover_color} !important; }`);
						if (items.cs_videopage_sliderbar_color)
							styleHead(`.video-js .vjs-progress-holder { background-color: ${items.cs_videopage_sliderbar_color} !important; }`);
						if (items.cs_videopage_sliderbar_seeked_color)
							styleHead(`.video-js .vjs-play-progress { background-color: ${items.cs_videopage_sliderbar_seeked_color} !important; }`);
						if (items.cs_videopage_sliderbar_buffered_color)
							styleHead(`.video-js .vjs-load-progress { background-color: ${items.cs_videopage_sliderbar_buffered_color} !important; }`);
						if (items.cs_videopage_sliderbar_handle_color_picker)
							styleHead(`.video-js .vjs-play-progress { color: ${items.cs_videopage_sliderbar_handle_color_picker} !important; }`);
					}
				});

			});

		}

	}

});

////////////////////
// SLIMMER HEADER //
////////////////////////////////////////////////////
// Idea by Swyter over at https://greasyfork.org/ //
////////////////////////////////////////////////////

chrome.storage.sync.get(['enableSlimHeader', 'enableCustomLogo'], function(items) {

	if (items.enableSlimHeader == true) {

		$('head').append(`<link href="${chrome.runtime.getURL('assets/css/SlimmerHeader.css')}" rel="stylesheet" type="text/css">`);

		if (items.enableCustomLogo == false || items.enableCustomLogo == null) $("head").append("<style>#head > h1 {background: transparent url("+chrome.extension.getURL("images/logos/logo-min.png")+") no-repeat !important}</style>");

		$(document).ready(function() {

			$('#result_box').next().remove();

			$('body').inject('inline-script', function() {

				$('#imgSearch').off('click').click(function() {
					if ($('#keyword').val().trim().length === 0) {
						window.location = '/AdvanceSearch';
					} else if ($('#keyword').val().trim().length < 2) {
						$('#keyword').blur();
						alert('Keyword must be more than one character!');
					} else {
						$("#formSearch").attr('action', "/Search/Anime");
						$("#formSearch").submit();
					}
				});

			});

			$('input#keyword').prop('placeholder', 'Search while empty for Advance Search');

		});

	}

});

$(document).ready(function() {

	var ads = ['#divAds', '#divAds2', '#adsIfrme1', '#adsIfrme2', '#adsIfrme3', '#adsIfrme6', '#adsIfrme7', '#adsIfrme8', '#adsIfrme10', '#adsIfrme11'];

	$.each(ads, function(index, ad) {

		if ($(ad).next().attr('class') === 'divCloseBut')
			$(ad).next().remove();
		
		$(`iframe${ad}, ${ad} iframe`).load(function() {

			try {

				this.contentWindow.document.readyState;

				var buttonContainer = $('<div class="divCloseBut">');

				var buttonInner = $('<a href="#">Hide</a>').click(function () {
					$(this).parent().prev().remove();
					$(this).parent().remove();
					return false;
				});

				buttonContainer.append(buttonInner);

				$(ad).after(buttonContainer);

			} catch(err) {

				// $('#')

			}

		});

	});

	chrome.storage.sync.get(function(items) {

		/////////////////
		// Hide Footer //
		/////////////////

		if (items.enableFooter == false) $('#footer').css('display', 'none');

		/////////////////////////////
		// REMOVE COMMENT SECTIONS //
		/////////////////////////////

		if (items.enableCommentSections == false) {

			$("#disqus_thread").closest('.bigBarContainer').remove();

			if ($("#centerDivVideo").length) {
				$('div:contains("Please do NOT spoil content of NEXT episodes ")', '#containerRoot').hide();
				$('#btnShowComments').parent().remove();
				$('#divComments').hide();
			}

		}

	});

	//////////////////////////////////////////////////////////
	//                     MISCELLANEOUS                    //
	//////////////////////////////////////////////////////////

	////////////////////
	// VERSION NUMBER //
	////////////////////

	chrome.storage.local.get(['version', 'version_name'], function(items) {
		$('html').attr('data-efka-version', items.version);
		if ($('#containerRoot').length)
			$('body').append(`<div id="version" data-version="${items.version}">Essentials for KissAnime Version: <a href="https://ke.pilar.moe/changelog" target="_blank">${items.version_name}</a></div>`);
	});

	//////////////////
	// GET USERNAME //
	//////////////////

	var user = $('#aDropDown > span').text().match(/([A-z,0-9])\w+/g);
	user = user ? user.toString() : 'Not Logged In';
	console.log(`%c KissEssentials %c User %c ${user} `, logStyleBeginning, logStyleMiddle, logStyleEnd);
	chrome.storage.local.set({ user });

	/////////////////////////////////////////////
	// Cleans up the Cloudflare clearance page //
	/////////////////////////////////////////////

	if ($('.cf-browser-verification').length) {

		$('head').append(`<style>
			html {
				background: rgb(37, 37, 37) !important;
				color: white !important;
				text-shadow: 1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0px 1px 0 #000,1px 0px 0 #000,0px -1px 0 #000,-1px 0px 0 #000 !important;
			}
			body > div:first-child > div:first-child {
				height: 90px !important;
			}
			body > div:nth-child(1) > div:nth-child(2) {
				margin-bottom: -20px;
			}
			body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
				display: none;
			}
			#contributors {
				text-align: center;
				margin: auto;
				width: 30%;
			}
			#contributors ul {
				list-style-type: none;
				padding: 0;
			}
		</style>`);

		$('#imgLogo').after('<div class="loader">Loading...</div>').remove();

		var quotes = [
			{ "author": "Shirou",		"quote": "People die if they are killed." },
			{ "author": "Hanekawa",		"quote": "I don't know everything, I just know what I know." },
			{ "author": "C.C.", 		"quote": "False tears bring pain to others. A false smile brings pain to yourself." },
			{ "author": "",				"quote": "Your name is..." },
			{ "author": "",				"quote": "Please don't lewd the dragon loli." },
			{ "author": "",				"quote": "404 not found." },
			{ "author": "",				"quote": "Have you tried turning it off and on again?" },
			{ "author": "Everyone",		"quote": "Chat is dead." },
			{ "author": "Kanacchi",		"quote": "I need to make a tough decision so I have some whiskey to help." },
			{ "author": "",				"quote": "Heroes never die." },
			{ "author": "",				"quote": "Okay... maybe sometimes..." },
			{ "author": "",				"quote": "(╯°□°）╯︵ ┻━┻" },
			{ "author": "",				"quote": "┬─┬﻿ ノ( ゜-゜ノ)" },
			{ "author": "",				"quote": "Your waifu is shit." },
			{ "author": "",				"quote": "You're gonna carry that weight." },
			{ "author": "",				"quote": "Haven't we met?..." },
			{ "author": "",				"quote": "Never bamboozle the bamboozler." },
			{ "author": "Chi",			"quote": "Tch" },
			{ "author": "pilar6195",	"quote": "I'm sorry to the hedgehogs of the world." },
			{ "author": "pilar6195",	"quote": "I'm sorry to the hedgehogs of the world again..." }
		];

		var selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

		$('body > div:first-child > div:nth-child(2) > div:last-child').before(`
			<div id="keContainer">
				<div style="text-align:center">Please wait 5 seconds...</div>
				<h4 style="text-align:center;color:skyblue">${selectedQuote.quote} ${selectedQuote.author ? ' - <i>' + selectedQuote.author + '</i>': ''}</h4>
			</div>
		`);

		chrome.runtime.sendMessage({ request: 'https://ke.pilar.moe/api/v2/supporters' }, function(data) {
			if (!data.success) return;
			$('#keContainer').append('<div id="contributors"><h3>KissEssentials Supporters</h3><ul></ul></div>')
			for (var i of data.data) $('#contributors ul').append(`<li>${i}</li>`);
		});

	}

	chrome.storage.sync.get(function(items) {
		console.log(`%c KissEssentials %c Sync Storage `, logStyleBeginning, logStyleEnd, items);
	});

});
