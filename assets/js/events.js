function initInterface()
{
	$("#time-slider").slider(
		{
			change: setTime,
			range: "min",
			step: 0.1
		});
}

function initEventHandlers()
{
    $("#time-slider").hover(onHoverTimeSliderIn,
                            onHoverTimeSliderOut);
}

function init()
{
    initInterface();
    initEventHandlers();
	updateOptions();
	updateSongs();
	updatePlayer();
	refreshTime();
	window.setInterval(function()
			           {
				           $('#time-slider')
					       .slider('option', 'value', $('#time-slider')
						                              .slider('option', 'value') +
								   (100 / $('#time-slider')
										  .data('duration')));
			           }, 1000);

}