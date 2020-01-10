// $(document).on('DOMContentLoaded', function() {
$(document).ready(function() {
	/////////////////////////////////////////////////////////
	// Prints version number in the corner of options page //
	/////////////////////////////////////////////////////////

	chrome.storage.local.get('version', function(items) {
		document.getElementById('version').textContent += ' (v'+items.version+')';
	});

	// Enable Bootstrap Tooltips
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
	
	// Set up Switch Boxes
	$.fn.bootstrapSwitch.defaults.size = 'small';
	$.fn.bootstrapSwitch.defaults.onColor = 'success';
	$.fn.bootstrapSwitch.defaults.offColor = 'danger';
	$.fn.bootstrapSwitch.defaults.onText = '&#10003;';
	$.fn.bootstrapSwitch.defaults.offText = '&#10007;';
	//$.fn.bootstrapSwitch.defaults.onText = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
	//$.fn.bootstrapSwitch.defaults.offText = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
	
	
	
	// Enable Switch Boxes
	$('input[type="checkbox"]').bootstrapSwitch();
	$('input[type="checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
		document.getElementById(this.id).checked = state;
	});

	// Set up Toastr Messages
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
		"timeOut": "3000",
		"extendedTimeOut": "1000",
		"showEasing": "linear",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	}

});