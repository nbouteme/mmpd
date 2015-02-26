<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'vendor/autoload.php';
require_once 'app/core/App.php';

function escapeshellarg1($file) {
  return "'" . str_replace("'", "'\"'\"'", $file) . "'";
}

App::run();

?>
