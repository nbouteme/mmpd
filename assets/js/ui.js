/*
 * Génere un élément à partir d'un objet JS le représentant, supporte les évènements.
 */
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
                    elem[k]([ elem, eObject.eventData ], eObject[k]);
                // NB: Si eventData est undefined, c'est la meme chose que de passer seulement l'argument eObject[k] // 1 semaine plus tard, j'ai aucune idée de ce que je voulais dire
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

/*
 * Crée un bloc d'information générique à placer dans la liste, à partir
 * d'une URL, de sous titres, et éventuellement la fonction de création de menu
 * lors du clic sur l'ellipse verticale avec des données à lui passer.
 * Les 3 derniers parametres sont optionnels.
 */
function makeGenericItem(imageurl, title, subtitle, menufn, data)
{
    var obj =
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
						    attr: { src: imageurl }
					    }
				    },
				    {
					    tag: 'div',
					    css: 'music-info',
					    children:
						[
                            {
							    tag: 'h4',
							    css: 'h4',
							    content: title
						    }
                        ]
				    }
			    ]
		    }
	    };

    if(menufn)
        obj.children.children[1].children.unshift(
			{
				tag: 'i',
				css: 'fa fa-ellipsis-v pull-right opt-menu',
				events:
				{
                    eventData: data,
					click: menufn
				}
			});

    if(subtitle)
        obj.children.children[1].children.push(
            {
				tag: 'h6',
				css: 'h6',
				content: subtitle
			});

    obj.children.children[1].children.push({tag: 'hr'});
    return elemFromObj(obj);
}

function makePlItemElem(music, pl)
{
    return makeGenericItem(
        '/mpd/songs/' + music.coverId + '/cover',
        music.title,
        !music.artist ? 'Inconnu' : music.artist,
        makePlItemMenu,
        [music, pl]
    ).data('pl', pl);
}

function makeMusicElem(music)
{
    return makeGenericItem(
        '/mpd/songs/' + music.coverId + '/cover',
        music.title,
        !music.artist ? 'Inconnu' : music.artist,
        makeMenu,
        music
    ).data('data', music);
}

function makeContextMenu(obj, p, edata)
{
    var root = { tag: 'div', css: 'context-menu' };
    root['children'] = [];
    for(var i in obj)
    {
        for(var j in obj[i])
            root.children.push(
            {
                tag: 'div',
                css: 'menu-item',
                content: obj[i][j][0],
                events: { eventData: edata, click: obj[i][j][1]}
            });
        if(i != obj.length - 1)
            root.children.push({tag: 'hr'});
    }

    var menu = elemFromObj(root);
    menu
		.hide()
		.appendTo("body");
    if(menu.outerWidth() + p[1] > $(document).width())
        p[1] -= menu.outerWidth();
    if(menu.outerHeight() + p[0] > $(window).height())
        p[0] -= menu.outerHeight();
    menu
	.show()
	.css({position: 'fixed', zIndex: 999, top: p[0] + "px", left: p[1] + "px"})
    .animate(
        {
            'max-height': '60%'
        });
    return menu;
}

function globalOptMenu(event)
{
    event.stopPropagation();
    $("div.context-menu").remove();

    var p = [
        event.clientY,
        event.clientX
    ];

    var musicMenu = makeContextMenu(
        [
            [
                [(document.lastSettings.repeat == "1" ? 'Désactiver' : 'Activer') + ' la répétition', toggleRepeat],
                [(document.lastSettings.single == "1" ? 'Désactiver' : 'Activer') + ' la lecture unique', toggleSingle],
                [(document.lastSettings.random == "1" ? 'Désactiver' : 'Activer') + ' la lecture aléatoire', toggleRandom]
            ]
        ], p);
}

function makeMenu(event)
{
	event.stopPropagation(); // Necessaire pour empecher la fermeture du menu
    $("div.context-menu").remove();
    var p = [
        event.clientY,
        event.clientX
    ];
    var music = event.data;
    var musicMenu = makeContextMenu(
        [
            [
                ['Ajouter à la file d\'attente', addToWl],
                ['Ajouter à une playlist', addToPl]
            ],
            [
                ['Voir Artiste', dispArtist],
                ['Voir Album', dispAlbum]
            ],
            [
                ['Télécharger', downloadTitle]
            ]
            
        ], p, music);
    musicMenu.data('sender', $(this)); // MA TETE AAAAAAHHHHHHHHHHHH
}

function makePlItemMenu(event)
{
	event.stopPropagation(); // Necessaire pour empecher la fermeture du menu
    $("div.context-menu").remove();
    var p = [
        event.clientY,
        event.clientX
    ];
    var music = event.data;
    var musicMenu = makeContextMenu(
        [
            [
                ['Ajouter à la file d\'attente', addToWl],
                ['Ajouter à une playlist', addToPl]
            ],
            [
                ['Voir Artiste', dispArtist],
                ['Voir Album', dispAlbum]
            ],
            [
                ['Supprimer de cette playlist', removeFromPl]
            ],
            [
                ['Télécharger', downloadTitle]
            ]
        ], p, music);
    musicMenu.data('sender', $(this)); // MA TETE AAAAAAHHHHHHHHHHHH
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

function loadMusicsFromArtist(event)
{
    var artname = event.data[1];
    loadMusics("artists/", artname, "/songs");
}

function loadMusicsFromAlbum(event)
{
    var artname = event.data[1];
    loadMusics("albums/", artname, "/songs");
}

function makeArtElem(art)
{
    var url = art == "" ? '/assets/img/cover_default.jpg' : '/mpd/artists/' + art + '/cover';
    art = art == "" ? "Inconnu" : art;
	return elemFromObj(
		{
			tag: 'div',
			css: 'col-lg-2 col-md-3 col-sm-4 col-xs-12',
            events:
            {
                eventData: art,
                click: loadMusicsFromArtist
            },
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
							attr: { src: url }
						}
					},
					{
						tag: 'div',
						css: 'music-info',
						children:
						[
							{
								tag: 'h4',
								css: 'h4',
								content: art
							},
							{tag: 'hr'}
						]
					}
				]
			}
		}).data('data', art);
}

var strat =
{
    Playlist: [ makePlElem, 'playlist'], 
    Albums: [ makeAlbElem, 'albums'],
    Artistes: [ makeArtElem, 'artists']
}

function pageMenu(event)
{
	event.stopPropagation(); // Necessaire pour empecher la fermeture du menu
    $("div.context-menu").remove();
    var p = [
        event.clientY,
        event.clientX
    ];
    var music = event.data;
    var musicMenu = makeContextMenu(
        [
            [
                ['Bibliothèque', loadPage],
                ['Playlist'    , loadPage],
                ['Artistes'    , loadPage],
                ['Albums'      , loadPage]
            ]
        ], p);
}

function loadMusics(src, arg, arg2, fnc) // seul arg est traité, il ne doit pas contenir de /
{
    src = src ? src : 'songs';
    arg = arg ? arg.replace('/', '%2F').replace('?', '%3F') : '';
    arg2 = arg2 ? arg2 : '';

    var fn = fnc ? fnc : makeMusicElem;
	$.ajax({
		url: "/mpd/" + src + arg + arg2,
		dataType: 'json'
	}).done(function(val)
		    {
                $('#music-list').empty();
			    for(var i = 0; i < val.length; ++i)
				    $('#music-list').append(fn(val[i]));
            });
}

function loadMusicsFromPlaylist(event)
{
    var artname = event.data[1];
    artname = artname == "En cours" ? 'current' : artname;
    loadMusics("playlists/", artname, "/songs");    
}

function playPlaylist(event)
{
    var name = '"' + event.data[1][1] + '"';
    corectl({cmd: 'load', args: name, finished:
             function()
             {
                 corectl({cmd: 'play 0'});
             }});
}

function clearPlaylist(event)
{
    var name = '"' + event.data[1][1] + '"';
    if(event.data[1][1] == "En cours")
        corectl({cmd: 'clear'});
    else
        corectl({cmd: 'playlistclear', args: name});
}

function deletePlaylist(event)
{
    var parent = event.data[1][0][0].parentElement.parentElement.parentElement;
    var name = '"' + event.data[1][1] + '"';
    corectl({cmd: 'rm', args: name});
    parent.remove();
}

function makePlaylistMenu(event)
{
    event.stopPropagation(); // Necessaire pour empecher la fermeture du menu
    $("div.context-menu").remove();
    var p = [
        event.clientY,
        event.clientX
    ];

    var name = event.data;

    var plMenu = makeContextMenu(
        [
            [
                ['Ajouter cette playlist à la file d\'attente', playPlaylist],
                ['Vider cette playlist', clearPlaylist]
            ],
            [
                ['Supprimer cette playlist', deletePlaylist]
            ]
        ]
    );
}

function selectPlaylist(callback) // sera rappelé avec en parametre le nom de la playlist choisie
{
	$.ajax({
		url: "/mpd/playlists",
		dataType: 'json'
	}).done(function(val)
		    {
                var menu = 
                {
                    tag: 'div',
                    css: 'select-pl-box',
                    children:
                    [
                        {
                            tag: 'h4',
                            content: 'Sélectionnez une playlist'
                        },
                        {
                            tag: 'div',
                            css: 'pl-select-list',
                            children: []
                        }
                    ]
                };

                function adapter(event)
                {
                    callback(event.data[1]);
                    menu.remove();
                }

                for(var pl in val)
                    menu.children[1].children.push(
                        {
                            tag: 'div', css: 'pl-select-item',
                            content: val[pl].playlist,
                            events: { eventData: val[pl].playlist, click: adapter }
                        });

                function newItem()
                {
                    var input = $('<input>')
                                .addClass('pl-new-name')
                                .keyup(function(e)
                                       {
                                           if(e.keyCode == 13)
                                               {
                                                   debugger;
                                                   callback($(this).val());
                                                   menu.remove();
                                               }
                                       });
                    $(this).parent().append(input);
                    $(this).remove();
                }

                menu.children[1].children.push(
                    {
                        tag: 'div', css: 'pl-select-item',
                        content: 'Nouvelle Playlist...',
                        events: { eventData: [], click: newItem }
                    });

                menu = elemFromObj(menu).hide();
                menu.appendTo('body');
                menu.show();
            });

}

function loadMusicsFromPlaylist(event)
{
    var name = event.data[1];
    name = name == "En cours" ? 'current' : name;
    var fn = makePlItemElem;
	$.ajax({
		url: "/mpd/playlists/" + name + "/songs",
		dataType: 'json'
	}).done(function(val)
		    {
                $('#music-list').empty();
			    for(var i = 0; i < val.length; ++i)
				    $('#music-list').append(fn(val[i], name));// J'ai toujours peur quand je fais ce genre de choses
            });

}

function makePlElem(name)
{
    if(!name.playlist)
    {
        name = { playlist: "En cours" };
        var url = '/mpd/songs/current/cover'
    }
    else
        var url = '/mpd/playlists/' + name.playlist + '/cover';
	return elemFromObj(
		{
			tag: 'div',
			css: 'col-lg-2 col-md-3 col-sm-4 col-xs-12',
            events:
            {
                eventData: name.playlist,
                click: loadMusicsFromPlaylist
            },
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
							attr: { src: url }
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
                                        eventData: name.playlist,
										click: makePlaylistMenu
									}
								]
							},
							{
								tag: 'h4',
								css: 'h4',
								content: name.playlist
							},
							{tag: 'hr'}
						]
					}
				]
			}
		});
}

function loadPlaylists(src)
{
    loadItems('playlists', makePlElem, function() {$('#music-list').append(makePlElem(''));});
}

function loadItems(src, fn, callback)
{
	$.ajax({
		url: "/mpd/" + src,
		dataType: 'json'
	}).done(function(val)
		    {
                $('#music-list').empty();
			    for(var i = 0; i < val.length; ++i)
				    $('#music-list').append(fn(val[i]));
                if(callback) callback();
            });
}

function loadArtists(src)
{
    loadItems('artists', makeArtElem);
}


function makeAlbElem(alb)
{
    var url = alb == "" ? '/assets/img/cover_default.jpg' : '/mpd/albums/' + alb.replace('/', '%2F').replace('?', '%3F') + '/cover';
    alb = alb == "" ? "Inconnu" : alb;
	return elemFromObj(
		{
			tag: 'div',
			css: 'col-lg-2 col-md-3 col-sm-4 col-xs-12',
            events:
            {
                eventData: alb,
                click: loadMusicsFromAlbum
            },
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
							attr: { src: url }
						}
					},
					{
						tag: 'div',
						css: 'music-info',
						children:
						[
							{
								tag: 'h4',
								css: 'h4',
								content: alb
							},
							{tag: 'hr'}
						]
					}
				]
			}
		});
}

function loadAlbums()
{
    loadItems('albums', makeAlbElem);
}

function updateSongs()
{
    switch(sessionStorage.getItem('page'))
    {
    case 'Bibliothèque':
        loadMusics('songs');
        break;
    case 'Artistes':
        loadArtists();
        break;
    case 'Albums':
        loadAlbums();
        break;
    case 'Playlist':
        loadPlaylists();
    }
}

function loadPage(event)
{
    var name = event.currentTarget.innerText;
    setPage(name);
}

function setPage(name)
{
    $('#page-sel-btn h3').text(name);
    if(!strat[name])
    {
        sessionStorage.setItem('page', 'Bibliothèque');
        $('#page-sel-btn h3').text('Bibliothèque');
    }
    else
        sessionStorage.setItem('page', name);
    updateSongs();
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
                console.log(val);
                document.lastSettings = val;
                if(val.state == "pause" || val.state == "stop")
                {
                    window.clearInterval($(document).data('inter'));
                    $(document).data('inter', null);
                }
                else if (!$(document).data('inter'))
                {
                    $(document).data('inter', window.setInterval(function()
			                                                     {
				                                                     $('#time-slider')
					                                                 .slider('option', 'value', $('#time-slider')
						                                                                        .slider('option', 'value') +
								                                             (100 / $('#time-slider')
										                                            .data('duration')));
			                                                     }, 1000));
                }

                if(((val.state == "pause" || val.state == "stop") && $("#ctrl-btn").hasClass('fa-pause'))
                || (val.state == "play" && $("#ctrl-btn").hasClass('fa-play')))
                    $("#ctrl-btn").toggleClass('fa-play').toggleClass('fa-pause');
                
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

function onMoveOverTimeSlider(event)
{
    var hint = $('.time-hint');
    var tri = $('.tri');

    var maxWidth = $(document).width();
    var elemWidth = hint.outerWidth();

    var totSecs = $('#time-slider').data('duration');
    var curSecs = totSecs * (event.clientX / maxWidth);
    var sTot = secondsToTime(totSecs);
    var sCur = secondsToTime(curSecs);

    var p = event.clientX;
    tri.css({position: 'fixed', zIndex: 999, bottom: "72px", left: (p > maxWidth - 9 ? maxWidth - 9 : p < 9 ? 9 : p) - tri.outerWidth() / 2 + "px"});
    p += p < (elemWidth / 2) ?  elemWidth / 2 - p : 0;

    p -= elemWidth / 2;
    p -= (p + elemWidth > maxWidth) ? p + elemWidth - maxWidth : 0;

    hint.html(sCur + '/' + sTot);
    hint.css({position: 'fixed', zIndex: 999, bottom: "80px", left: p + "px"});
}

function onHoverTimeSliderIn(event)
{
    var totSecs = $('#time-slider').data('duration');
    var curSecs = totSecs * (event.clientX / $(document).width());
    var sTot = secondsToTime(totSecs);
    var sCur = secondsToTime(curSecs);
    var hint = elemFromObj(
        {
            css: 'time-hint',
            tag: 'div',
            content: sCur + '/' + sTot
        }).hide();

    var tri = elemFromObj(
        {
            css: 'tri',
            tag: 'div'
        }).hide();
    var p = event.clientX;
    hint.appendTo('body');
    tri.appendTo('body');

    tri.css({position: 'fixed', zIndex: 999, bottom: "72px", left: p - tri.width() / 2 + "px"});
    p -= hint.outerWidth() / 2;
    hint.css({position: 'fixed', zIndex: 999, bottom: "80px", left: p + "px"});

    hint.show();
    tri.show();
}

function askFullScreen()
{
    if(!navigator.userAgent.match('Android') || document.webkitIsFullScreen || sessionStorage.getItem('refused'))
        return;

    var modalAsk = elemFromObj(
        {
            tag: 'div',
            css: 'mod-dialog',
            children:
            [{
                tag: 'div',
                css: 'dialog',
                content: 'Il est recommendé de passer en mode plein écran pour une expérience plus comfortable',
                children:
                [{
                    tag: 'div',
                    children:
                    [
                        {
                            tag: 'p',
                            content: 'Continuer ?'
                        },
                        {
                            tag: 'div',
                            children:
                            [{
                                tag: 'button',
                                css: 'btn btn-default modal-btn',
                                content: 'Non merçi',
                                events:
                                [{
                                    click: function(){sessionStorage.setItem('refused', true); modalAsk.remove();}
                                }]
                            },
                             {
                                 tag: 'button',
                                 css: 'btn btn-primary modal-btn',
                                 content: 'Oui',
                                 events:
                                 [{
                                     click: function()
                                     {
                                         var docElm = document.documentElement;
                                         if (docElm.requestFullscreen)
                                             docElm.requestFullscreen();
                                         else if (docElm.webkitRequestFullScreen)
                                             docElm.webkitRequestFullScreen();
                                         modalAsk.remove();
                                     }
                                 }]
                             }]
                        }]
                }]
            }]
        }).appendTo('body').show();
}

function onHoverTimeSliderOut(event)
{
    $('div.time-hint').remove();
    $('div.tri').remove();
}
