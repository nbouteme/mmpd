<?php

error_reporting(1);
ini_set('display_errors', 1);

require_once 'vendor/autoload.php';
require_once 'app/core/Config.php';
require_once 'app/controllers/MPDController.php';

Config::Load();

$mpd = new MPDController();
$mpd->_notify();

?>
