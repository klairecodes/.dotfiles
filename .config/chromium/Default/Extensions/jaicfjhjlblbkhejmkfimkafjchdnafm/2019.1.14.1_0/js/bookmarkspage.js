document.addEventListener('DOMContentLoaded', function() {

	//////////////////////////////////////////////////////////
	//                    BOOKMARKS PAGE                    //
	//////////////////////////////////////////////////////////

	$('.clear2[style*="padding-top:50px"]').css('padding-top', '0px');

	chrome.storage.sync.get('relocateAiringBookmarks', function(items) {

		if (items.relocateAiringBookmarks == true) {
			$('.listing tr').removeClass('odd');
			$('.trAnime td:nth-child(2):not(:contains("Completed"))').parent().detach().insertAfter('.listing > tbody > tr:nth-child(2)');
			$('.listing tr:nth-child(2n+3)').css('background','none repeat scroll 0 0 #161616');
		}

	});

	// $('.listing .head th:last-child').attr('width', '17%');

	// $('.listing .head').append(`<th></th>`);

	// $('.trAnime').each(function(index, element) {

	// 	$(element).append(`<td><a style="cursor:pointer">Edit on MAL</a></td>`);

	// });

});
