function makeMusicElem(music)
{
	return $('<div>')
		.addClass('col-lg-2 col-md-3 col-sm-4 col-xs-12')
		.append(
			$('<div>').addClass('music-box').append(
				$('<div>').addClass('box').append(
					$('<img>').addClass('dummy-content')
						.attr('src', '/mpd/songs/' + music.coverId + '/cover')
				)
			).append(
				$('<div>').addClass('music-info').append(
					$('<h4>').addClass('h4').html(music.title)
				).append(
					$('<h6>').addClass('h6').html(music.artist)
				).append($('<hr>'))));
}

function refreshTime()
{
	var timeRefresh = $.ajax(
		{
			url: "/mpd/songs/current/time",
			dataType: "json"
		});

	timeRefresh.done(function(val)
					 {
						 if(!$('#time-slider').prohibit)
							 $('#time-slider')
							 .slider('value',
									 100 *
									 val.currentSec /
									 val.durationSec);
						 $('#time-slider').prohibit = false;
						 $('#time-slider').data('duration', val.durationSec);
					 });

}

function updateOptions()
{
	console.log('Updating options');
	$.ajax(
		{
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

function updatePlaylist()
{
	console.log('Updating playlist');
	$.ajax(
		{
			url: "/mpd/playlist",
			dataType: 'json'
		}).done(function(val)
				{
					console.log('Received playlist');
					if(!$('#music-list').data('musics'))
					{
						$('#music-list').data('musics', val);
						for(var i = 0; i < val.length; ++i)
							$('#music-list').append(makeMusicElem(val[i]));
						return;
					}
					var add = musicDiff(val, $('#music-list').data('musics'));
					var sub = musicDiff($('#music-list').data('musics'), val);
					for(var i = 0; i < add.length; ++i)
						$('#music-list').append(makeMusicElem(add[i]));
					var array = $('#music-list');
					if(sub.length != 0)
					{
						$('#music-list > div').each(
							function(i)
							{
								for(var i = 0; i < sub.length; ++i)
									if('/mpd/songs/' +
									   sub[i].coverId +
									   '/cover' == url)
								{
									$(this).remove();
									return;
								}
							});
					}
					$('#music-list').data('musics', val);
				});
	refreshTime();
}

function updatePlayer()
{
	console.log('Updating player');

	$.ajax(
		{
			url: "/mpd/settings",
			dataType: 'json'
		}).done(function(val)
				{
					console.log('Received MPD state');
					if(val.state != 'stop')
					{
						$.ajax(
							{
								url: "/mpd/songs/current",
								dataType: 'json'
							}).done(function(val)
									{
										console.log('Received player data');
										$('#current-tags h4').html(val.Title);
										$('#current-tags h6').html(val.Artist);
										$('#current-playing').attr('src',
																   '/mpd/songs/'
																   + val.coverId
																   + '/cover');
									});
					}
				});
	refreshTime();
}

var source = new EventSource("/server.php");
source.onmessage = function(event)
{
	console.log(event.data);
	var obj = JSON.parse(event.data);
	switch(obj.changed)
	{
		case 'options': updateOptions(); break;
		case 'playlist': updatePlaylist(); break;
		case 'player': updatePlayer(); break;
		default:
		console.log('Unhandled action: ' + obj.changed);
	}
}

$(document).ready(
	function()
	{
		$("#time-slider").slider(
			{
				change: function(event)
				{
					if(!event.originalEvent) return;
					$(this).prohibit = true;
					var val = $('#time-slider').slider('value') / 100;
					$.ajax(
						{
							url:         "/mpd/songs/current/time",
							type:        'POST',
							processData: false,
							dataType:    'json',
							data: val
						});
				},
				range: "min",
				step: 0.1
			});
		updateOptions();
		updatePlaylist();
		updatePlayer();
		refreshTime();
		window.setInterval(function()
						   {
							   $('#time-slider')
								   .slider('option', 'value', $('#time-slider')
										   .slider('option', 'value') +
										   (100 / $('#time-slider')
											.data('duration')));
						   }
						   , 1000);

	}
);
