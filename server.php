<?php
require_once 'app/controllers/MPDController.php';
require_once 'app/core/Config.php';

error_reporting(1);
ini_set('display_errors', 1);

echo 'data: { "ping": "pong" }'; // Le navigateur ferme la connexion si il ne lis rien de la part du serveur au debut pendant trop de temps.

$mpd = new MPDController();
$mpd->_notify();

?>
