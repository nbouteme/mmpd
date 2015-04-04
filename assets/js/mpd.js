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

function getSettings(callback)
{
    $.ajax(
	    {
	        url:         "/mpd/settings",
	        type:        'GET',
	        processData:  false,
	        dataType:    'json'
	    }).done(callback);
}

function setRepeat(context, v)
{
    assignSetting('repeat', 1);
}

function assignSetting(name, val)
{
    // Todo: changer le script coté serveur pour accepter plusieur types de para
    val |= 0; // cast val en nombre, et le reassigne
    $.ajax(
	    {
	        url:         "/mpd/settings/" + name,
	        type:        'POST',
	        processData:  false,
	        dataType:    'json',
	        data: val
	    });
}

function toggleRepeat(context)
{
    console.log('Changement repetition');
    var val = document.lastSettings.repeat == "0";
    assignSetting('repeat', val);
}

function setRandom(context)
{
    assignSetting('random', 1);
}

function toggleRandom(context)
{
    var val = document.lastSettings.random == "0";
    assignSetting('random', val);
}

function toggleSingle(context)
{
    var val = document.lastSettings.single == "0";
    assignSetting('single', val);
}

function gotoNext(context)
{
    var cmd =
        {
            cmd: 'next'
        };

    var ret = corectl(cmd);
    return ret;
}

function gotoPrev(context)
{
    var cmd =
        {
            cmd: 'previous'
        };

    var ret = corectl(cmd);
    return ret;
}

function togglePlayback(context)
{
    if(document.lastSettings.state == "stop")
        var cmd =
            {
                cmd: 'play'
            };
    else
        var cmd =
            {
                cmd: 'pause'
            };

    var ret = corectl(cmd);
    return ret;
}

function corectl(cmdObject) // J'en ai eu marre d'ecrire du PHP alors je controle mpd full javascript now
{
    /*
     * cmdObject contient les champs cmd pour la commande, args, pour 
     * les arguments (meme si au final le script php va juste les concactener)
     * process, qui si existe, va demander a effectuer un certain traitement, par exemple
     * si la reponse est un tableau d'un seul element, le forcer dans un tableau
     * (pour uniformiser du traitement principalement)
     * le script php derriere va uniformiser le nom des variables membres, et renvoyer du json
     * */

    console.log('Sending sum sheet');
    
    var val = JSON.stringify(cmdObject);
    $.ajax(
	    {
            async:       !cmdObject.sync,
	        url:         "/mpd/core",
	        type:        'POST',
	        processData: false,
	        dataType:    'json',
	        data: val
	    }).done(cmdObject.finished);
    return val;
}
