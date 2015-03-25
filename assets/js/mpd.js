function setTime(context)
{
    if(!context.originalEvent) return;
    var val = $('#time-slider').slider('value') / 100;
    $.ajax(
	    {
	        url:         "/mpd/songs/current/time",
	        type:        'POST',
	        processData:  false,
	        dataType:    'json',
	        data: val
	    });
}