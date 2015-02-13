<?php

class View
{
    static private $twig;
    static private $loader;
    static public function render($view, $data = array())
    {
        echo self::$twig->render($view . '.html', $data);
    }

    static public function load()
    {
        self::$loader = new Twig_Loader_Filesystem('app/views');
        self::$twig = new Twig_Environment(self::$loader);
        $functions = array();

        $functions[] = new Twig_SimpleFunction('url', function($rel)
        {
            return Url::to($rel);
        });

        $functions[] = new Twig_SimpleFunction('loggedIn', function()
        {
            return Auth::isLoggedIn();
        });

        $functions[] = new Twig_SimpleFunction('loggedUser', function()
        {
            return $_SESSION['user'];
        });

        $functions[] = new Twig_SimpleFunction('truncate', function($str, $n, $ellipse = '...')
        {
            if(strlen($str) > $n)
                return substr($str, 0, $n) . $ellipse;
            return $str;
        });

        $functions[] = new Twig_SimpleFunction('eventOwner', function($id)
        {
            Database::connect();
            return Event::getProp($id);
        });
        
        $functions[] = new Twig_SimpleFunction('hasSignedUpFor', function($id)
        {
            Database::connect();
            return Event::hasSubscribedFor($_SESSION['user'], $id);
        });

        $functions[] = new Twig_SimpleFunction('friendOf', function($name)
        {
            Database::connect();
            return Friend::isFriendOf($_SESSION['user'], $name);
        });

        foreach($functions as $f)
        self::$twig->addFunction($f);
    }
}
View::load();
