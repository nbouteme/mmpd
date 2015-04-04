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
    $("#time-slider").mousemove(onMoveOverTimeSlider);
    $("#ctrl-btn").click(togglePlayback);
    $("#prev-btn").click(gotoPrev);
    $("#next-btn").click(gotoNext);
    $("#gl-opt-btn").click(globalOptMenu);
    $("#page-sel-btn").click(pageMenu);

    // mobile // jquerymobile est pas mal *fat*, donc vaut mieux le charger qu'en cas de besoin
    if(navigator.userAgent.match('Android'))
        $.getScript( "/assets/js/jquery.mobile.custom.js",
                     function()
                     {
                         $("#music-ctrl").on("swipeleft", gotoPrev);
                         $("#music-ctrl").on("swiperight", gotoNext);
                     });
}

function init()
{
    if(!sessionStorage.getItem('page'))
        sessionStorage.setItem('page', 'Bibliothèque');

    askFullScreen();
    initInterface();
    initEventHandlers();

    updateOptions();

    //updateSongs(makeMusicElem, 'songs');
    setPage(sessionStorage.getItem('page'));

    updatePlayer();

    refreshTime();
}