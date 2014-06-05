$(document).ready(function() {

	var headerHeight = 48;
    var textboxAndTopicHeight = 64;
	var currentHeight = $(window).height();
		$('#buffer-pane').css('height', currentHeight - headerHeight);
		$('#center').css('height', currentHeight - headerHeight);
		$('#nick-pane').css('height', currentHeight - headerHeight);
		$('#backlog-container').css('height', currentHeight - headerHeight - textboxAndTopicHeight);

	$(window).resize(function() {

		var currentHeight = $(window).height();
		$('#buffer-pane').css('height', currentHeight - headerHeight);
		$('#center').css('height', currentHeight - headerHeight);
		$('#nick-pane').css('height', currentHeight - headerHeight);
        $('#backlog-container').css('height', currentHeight - headerHeight - textboxAndTopicHeight);

	});

$(document).on("click", ".expanded", function() {
	var channel = $(this).data("target");
	$("#" + channel).css("max-height","0px");
	$(this).toggleClass("expanded collapsed");
	console.log("blaa");
});

$(document).on("click", ".collapsed", function() {
	var channel = $(this).data("target");
	$("#" + channel).css("max-height","100%");
	$(this).toggleClass("expanded collapsed");
	console.log("bluu");
});

$( "#hide-buffers" ).click(function() {
	$(this).hide();
	$("#show-buffers").show();
	$("#buffer-pane").css("margin-left","-168px");
	$("#buffer-pane").children().css("opacity","0");
	$("#center").css("margin-left","32px");
	$(".buffer-bottom-bar").css("opacity","1");
	$("#show-buffers").css("opacity","1");
});

$( "#show-buffers" ).click(function() {
	$(this).hide();
	$("#hide-buffers").show();
	$("#buffer-pane").css("margin-left","0px");
	$("#buffer-pane").children().css("opacity","1");
	$("#center").css("margin-left","200px");
});

$( "#hide-nicks" ).click(function() {
	$(this).hide();
	$("#show-nicks").show();
	$("#nick-pane").css("margin-right","-168px");
	$("#nick-pane").children().css("opacity","0");
	$("#center").css("margin-right","32px");
	$(".buffer-bottom-bar").css("opacity","1");
	$("#show-nicks").css("opacity","1");
});

$( "#show-nicks" ).click(function() {
	$(this).hide();
	$("#hide-nicks").show();
	$("#nick-pane").css("margin-right","0px");
	$("#nick-pane").children().css("opacity","1");
	$("#center").css("margin-right","200px");
});

$(document).on("click", ".add-channel", function () {
     var NetworkId = $(this).data('network');
     $("#join-network-name").html( NetworkId );
});

$('#modal-join-channel').on('hidden.bs.modal', function () {
      $('#modal-join-channel-name').val("");
 });

});