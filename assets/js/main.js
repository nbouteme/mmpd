function elemFromObj(js)
{
	var elem;
	elem = $('<' + js.tag + '>');
	for(var key in js)
	{
		switch(key)
		{
			case 'css':
			elem.addClass(js.css);
			break;

			case 'attr':
			for(var k in js.attr)
				elem.attr(k, js.attr[k]);
			break;

			case 'content':
			elem.html(js.content);
			break;

			case 'children':
			if(js.children.constructor !== Array)
				elem.append(elemFromObj(js.children));
			else
				for(var c in js.children)
					elem.append(elemFromObj(js.children[c]));
			break;

			case 'events':
			if(js.events.constructor !== Array)
				for(var k in js.events)
					elem[k](js.events[k]);
			else
				for(var c in js.events)
					for(var k in js.events[c])
						elem[k](js.events[c][k]);

		}
	}

	return elem;
}

function makeMusicElem(music)
{
	var elem = elemFromObj(
		{
			tag: 'div',
			css: 'col-lg-2 col-md-3 col-sm-4 col-xs-12',
			children:
			{
				tag: 'div',
				css: 'music-box',
				children:
				[
					{
						tag: 'div',
						css: 'box',
						children:
						{
							tag: 'img',
							css: 'dummy-content',
							attr: { src: '/mpd/songs/' + music.coverId + '/cover' }
						}
					},
					{
						tag: 'div',
						css: 'music-info',
						children:
						[
							{
								tag: 'i',
								css: 'fa fa-ellipsis-v pull-right opt-menu',
								events:
								[
									{
										click: function()
										       {
												   alert('click');
											   }
									}
								]
							},
							{
								tag: 'h4',
								css: 'h4',
								content: music.title
							},
							{
								tag: 'h6',
								css: 'h6',
								content: !music.artist ? 'Inconnu' : music.artist
							},
							{tag: 'hr'}
						]
					}
				]
			}
		}).data('data', music);
	//elem.find('.fa-ellipsis-v').click();
	return elem;
}

function refreshTime()
{
	$.ajax({
		url: "/mpd/songs/current/time",
		dataType: "json"
	}).done(function(val)
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

function updatePlaylist()
{
	console.log('Updating playlist');
	$.ajax({
		url: "/mpd/songs",
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
				$('#music-list').data('musics', val);
			});
	refreshTime();
}

function updatePlayer()
{
	console.log('Updating player');

	$.ajax({
		url: "/mpd/settings",
		dataType: 'json'
	}).done(function(val)
			{
				console.log('Received MPD state');
				if(val.state != 'stop')
					$.ajax({
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
			});
	refreshTime();
}

var source = new EventSource("/server.php");
source.onmessage = function(event)
{
	console.log(event.data);
	switch(JSON.parse(event.data).changed)
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
					var val = $('#time-slider').slider('value') / 100;
					$.ajax(
						{
							url:         "/mpd/songs/current/time",
							type:        'POST',
							processData:  false,
							dataType:    'json',
							data: val
						});
				},
				range: "min",
				step: 0.1
			});


		$('#pl-reveal').click(function()
							 {
								 if($('.music-bar').data('toggled'))
								 {
									 $('.music-bar').animate({bottom: '0'}, {queue: false}, 200)
										 .data('toggled', false);
									 $('#playlist').animate({top: '100%'}, {queue: false}, 200);
								 }				   
								 else
								 {
									 $('.music-bar').animate({bottom: '70%'}, {queue: false}, 200)
										 .data('toggled', true);
									 $('#playlist').animate({top: '30%'}, {queue: false}, 200);
								 }
								 $(this).toggleClass('toggled');
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
						   }, 1000);
	}
);
