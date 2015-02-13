<?php
require_once 'app/controllers/MPDController.php';
require_once 'app/core/Config.php';

error_reporting(1);
ini_set('display_errors', 1);

$mpd = new MPDController();
$mpd->notify();

?>
