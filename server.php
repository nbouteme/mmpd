<?php

error_reporting(1);
ini_set('display_errors', 1);

require_once 'vendor/autoload.php';
require_once 'app/core/Config.php';
require_once 'app/controllers/MPDController.php';

/*
header('Connection: Keep-Alive');
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no'); // pour nginx
header('Transfer-encoding: chunked');

ob_end_clean();

$server = new Hoa\Eventsource\Server();

while(true)
{
    $mpd->_notify();
    // “tick” is the event name.
    $fp = fopen('test', 'a');
    fwrite($fp, '1');
    fclose($fp);
    $server->tick->send(time());
    $server->data->send('sdfsdf');
    sleep(1);
}
*/

$mpd = new MPDController();
$mpd->_notify();

?>
