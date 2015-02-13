<?php

class Url
{
    static public function getURI()
    {
        return explode('?', $_SERVER['REQUEST_URI'])[0] . '/';
    }

    static public function to($path)
    {
        echo 'http://' . Config::get('App.Host') . ($path[0] != '/' ? '/' : '') . $path;
    }

    static public function redirectTo($url)
    {
        header('Location: ' . ($url[0] != '/' ? '/' : '') . $url);
        die();
    }
}