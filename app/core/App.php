<?php

class App
{
    static function run()
    {
        require_once 'app/core/Request.php';
        require_once 'app/core/Url.php';        
        require_once 'app/core/WebSocket.php';        
        require_once 'app/core/Router.php';
        require_once 'app/core/View.php';
        require_once 'app/core/Auth.php';
        require_once 'app/core/Config.php';
        if(substr($_SERVER['REQUEST_URI'], -1) === '/' && strlen($_SERVER['REQUEST_URI']) > 1)
            Url::redirectTo(substr($_SERVER['REQUEST_URI'], 0, -1));
        session_start();
        spl_autoload_register(
            function($class)
            {
                require 'app/models/' . $class . 'Model.php';
            });
        Config::load();
        Router::load();

        if(isset($_SESSION['user']))
        {
            Database::connect();
            Users::updateLastSeen($_SESSION['user']);
            Database::disconnect();
        }
        Router::dispatch();
    }
}
?>
