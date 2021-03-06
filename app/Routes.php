<?php
Router::register('GET', ['url'        => '/'                           ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'home']);

Router::register('GET', ['url'        => '/mpd/settings'               ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getSettings']);

Router::register('GET', ['url'        => '/mpd/settings/volume'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getVolume']);

Router::register('GET', ['url'        => '/mpd/settings/repeat'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'isRepeated']);

Router::register('POST', ['url'       => '/mpd/settings/repeat'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'setRepeat']);

Router::register('POST', ['url'       => '/mpd/settings/single'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'setSingle']);

Router::register('GET', ['url'        => '/mpd/settings/random'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'isRandom']);

Router::register('POST', ['url'       => '/mpd/settings/random'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'setRandom']);

Router::register('GET', ['url'        => '/mpd/songs'                  ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getSongs']);

Router::register('GET', ['url'        => '/mpd/songs/current'          ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getCurrent']);

Router::register('GET', ['url'        => '/mpd/songs/current/cover'    ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getCurrentCover']);

Router::register('GET', ['url'        => '/mpd/songs/{id}/cover'       ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getCover']);
Router::register('GET', ['url'        => '/mpd/artists/{id}/cover'       ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getArtistCover']);
Router::register('GET', ['url'        => '/mpd/songs/current/time'     ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getCurrentTime']);

Router::register('POST', ['url'       => '/mpd/songs/current/time'     ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'setCurrentTime']);

Router::register('GET', ['url'        => '/mpd/notification'           ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'notify']);

Router::register('GET', ['url'        => '/mpd/artists'                ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getArtists']);

Router::register('GET', ['url'        => '/mpd/albums'                 ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getAlbums']);

Router::register('GET', ['url'        => '/mpd/albums/{id}/songs'                 ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getAlbumContent']);

Router::register('GET', ['url'        => '/mpd/albums/{id}/cover'      ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getAlbumCover']);

Router::register('GET', ['url'        => '/mpd/artists/{artist}/songs' ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getSongsFromArtist']);

Router::register('GET', ['url'        => '/mpd/artist/{albums}'        ,
                         'controller' => 'MPDController'               ,
                         'action'     => 'getArtistOfAlbum']);

Router::register('POST', ['url'        => '/mpd/core'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'backdoor']);

Router::register('GET', ['url'        => '/mpd/download/{fn}'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'download']);

Router::register('GET', ['url'        => '/mpd/playlists/current/songs'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'getPlaylist']);

Router::register('GET', ['url'        => '/mpd/playlists/{name}/songs'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'getPlaylistContent']);

Router::register('GET', ['url'        => '/mpd/playlists'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'getPlaylists']);
Router::register('GET', ['url'        => '/mpd/playlists/current/cover'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'getCurrentPlaylistCover']);
Router::register('GET', ['url'        => '/mpd/playlists/{name}/cover'            ,
                         'controller' => 'MPDController'        ,
                         'action'     => 'getPlaylistCover']);

?>
