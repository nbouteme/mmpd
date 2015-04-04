// Decommenter pour supprimer l'affichage
//
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
            document.lastSettings = val;
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

function handleData(obj)
{
    switch(obj.changed)
    {
        case 'options': updateOptions();   break;
        case 'playlist': /* On verra plus tard... */ break;
        case 'player': updatePlayer();     break;
        default:
        console.log('Unhandled action: ' + obj.changed);
    }
}

source.addEventListener("data",
                        function(event)
                        {
                            var obj = JSON.parse(event.data);
                            
                            if(obj.constructor !== Array)
                                handleData(obj);
                            else
                                for(var i in obj)
                                    handleData(obj[i]);
                        });

source.onerror = function(event)
{
    updateOptions();
    updatePlayer();
};

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
