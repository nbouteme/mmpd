
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
			elem.text(js.content);
			break;
			
			case 'children':
			if(js.children.constructor !== Array)
				elem.append(elemFromObj(js.children));
			else
				for(var child in js.children)
				elem.append(elemFromObj(js.children[child]));
			break;
			
			case 'events':
            var createEvents = function(eObject) {
				for(var k in eObject)
                    if(k == 'eventData') continue;
                else
                    elem[k]([ elem, elem.eventData ], eObject[k]);
                // NB: Si eventData est undefined, c'est la meme chose que de passer seulement l'argument eObject[k]
                // je suppose que c'est comme ca que javascript gere les argument optionnels en interne.
            }
			if(js.events.constructor !== Array) // Si ce n'est pas un tableau
                createEvents(js.events);
			else
				for(var c in js.events) createEvents(js.events[c]);
		}
	}

	return elem;
}

function makeMusicElem(music)
{
	return elemFromObj(
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
                                        eventData: music,
										click: makeMenu
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
}


function makeMenu(event)
{
	event.stopPropagation();
    $("div.context-menu").remove();
    var p = [
        event.pageY,
        event.pageX
    ];
    var music = event.data;
    var musicMenu = elemFromObj(
        {
            tag: 'div',
            css: 'context-menu',
            children:
            [
                {
                    css: 'menu-item',
                    tag: 'div',
                    content: 'Ajouter à la file d\'attente',
					events:
					{
						eventData: music,
						click: addToWl
					}
                },
                {
                    css: 'menu-item',
                    tag: 'div',
                    content: 'Ajouter à une playlist',
					events:
					{
						eventData: music,
						click: addToPl
					}
                },
                {
                    tag: 'hr'
                },
                {
                    css: 'menu-item',
                    tag: 'div',
                    content: 'Voir Artiste',
					events:
					{
						eventData: music,
						click: dispArtist
					}
                },
                {
                    css: 'menu-item',
                    tag: 'div',
                    content: 'Voir Album',
					events:
					{
						eventData: music,
						click: dispAlbum
					}
                },
                {
                    tag: 'hr'
                },
                {
                    css: 'menu-item',
                    tag: 'div',
                    content: 'Télécharger',
					events:
					{
						eventData: music,
						click: downloadTitle
					}
                }
            ]
        });

    musicMenu
		.hide()
		.appendTo("body");
    if(musicMenu.outerWidth() + p[1] > $(document).width())
        p[1] -= musicMenu.outerWidth();
    if(musicMenu.outerHeight() + p[0] > $(document).height())
        p[0] -= musicMenu.outerHeight();

    musicMenu
		.show()
		.css({position: 'absolute', zIndex: 999, top: p[0] + "px", left: p[1] + "px"});
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


function updateSongs()
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
					function(arg)
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

function onHoverTimeSliderIn(event)
{
    var totSecs = $('#time-slider').data('duration');
    var curSecs = $('#time-slider').slider('value') * totSecs / 100;
    var sTot = secondsToTime(totSecs);
    var sCur = secondsToTime(curSecs);
    var hint = elemFromObj(
        {
            css: 'time-hint',
            tag: 'div',
            content: sCur + '/' + sTot
        }).hide()
    var p = event.clientX;
    hint.appendTo('body');
    p -= hint.width() / 2;
    console.log(p);
    hint.css({position: 'fixed', zIndex: 999, bottom: "80px", left: p + "px"});
    hint.show();
}

function onHoverTimeSliderOut(event)
{
    $('div.time-hint').remove();
}