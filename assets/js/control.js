function removeFromPl(event)
{
    var parent = event.data[1][0][0].parentElement.parentElement.parentElement; // :^)
    var arr = event.data[1][1];
    var cmd = arr[1] == 'current' ? cmd = 'delete' : 'playlistdelete ' + arr[1]

    corectl(
        {
            cmd: cmd,
            args: $("div.content > div").index(parent)
        });

    parent.remove();
    //$("div.content > div").index(parent).remove();
}

function addToPl(event)
{
    if(0 in event.data[1][1])
        if('file' in event.data[1][1][0])
            event.data[1][1] = { file: event.data[1][1][0].file };
    var fn = '"' + event.data[1][1].file + '"';
    debugger;

    selectPlaylist(function(chosen)
                   {
                       corectl({cmd: 'playlistadd ' + chosen, args: fn});
                   });
}

function handleResp(resp)
{
    console.log('Handlin\' sum sheet');
}

function addToWl(event)
{
    var parent = $(this).parent().data('sender').parent().parent(); // Oui. Toutafeh.
    if(0 in event.data[1][1])
        if('file' in event.data[1][1][0])
            event.data[1][1] = { file: event.data[1][1][0].file };
    var fn = '"' + event.data[1][1].file + '"';
    corectl({cmd: 'add', args: fn, finished: handleResp});
    parent.effect("transfer", { to: "#music-ctrl" }, 500);
}

function dispAlbum(event)
{
    var album = event.data[1][1].album;
    $('#page-sel-btn h3').text('Albums');
    loadMusics('albums/' + album + '/songs');    
}

function dispArtist(event)
{
    var artist = event.data[1][1].artist;
    $('#page-sel-btn h3').text('Artistes');
    loadMusics('artists/' + artist + '/songs');
}

function downloadTitle(event)
{
    location.href = '/mpd/download/' + event.data[1][1].file;
}
