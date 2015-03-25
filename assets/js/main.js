// Decommenter pour supprimer l'affichage
//console.log = function(){}
//var $;

function updateOptions()
{
	console.log('Updating options');
	$.ajax({
		url: "/mpd/settings",
		dataType: 'json'
	}).done(function(val)
		{
			console.log('Received options');
			// Mettre a jour repeat et random ici
		});
}

function musicDiff(a, b)
{
	return $(a).not(function(index, elem)
		{
			for(var i = 0; i < b.length; ++i)
				if(b[i].coverId == elem.coverId) return true;
			return false;
		})
}

var source = new EventSource("/server.php");
source.onmessage = function(event)
{
	console.log(event.data);
	switch(JSON.parse(event.data).changed)
	{
		case 'options': updateOptions();   break;
		case 'playlist': updateSongs(); break;
		case 'player': updatePlayer();     break;
		default:
		console.log('Unhandled action: ' + obj.changed);
	}
}

$(document).bind('click', function(event)
    {
        $("div.context-menu").remove();
    });

function secondsToTime(sec, sep)
{
    if(!sep) sep = ':';
    var str = Math.floor(sec / 60);
    str += sep;
    str += (sec % 60 < 10 ? '0' : '') + ~~sec % 60;
    return str;
}

$(document).ready(init);
