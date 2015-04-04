<?php

class Router
{     
    static private $routes;
    
    static public function load()
    {          
        require_once 'app/Routes.php';
    }

    // Associe une url et une methode a un controlleur et une action
    static public function register($method, $target)
    {
        include_once 'app/controllers/' . $target['controller'] . '.php';
        $route                   = self::parseUrl($target['url']);
        $route['url']            = $target['url'];
        $route['controller']     = $target['controller'];
        $route['action']         = $target['action'];
        self::$routes[$method][] = $route;
    }

    // Cette fonction genere une expression reguliere qui permet de reconnaitre les URL de la meme forme (/user/abc et /user/def ont une regex identique, qui permetra d'utiliser pour les 2 le controller d'utilisateur)
    static private function parseUrl($uri)
    {
        $parts = explode('/', $uri);
        unset($parts[0]);
        $parsed['pattern'] = '#^\\/'; // patttern est le motif
        $parsed['params']  = array(); // contien les arguments
        $parsed['par']  = ['needed' => array(), 'optional' => array()]; // par contient 2 tableau avec le nom des argument
        foreach ($parts as $part)
            if (strlen($part) < 3)
                $parsed['pattern'] .= $part . '\\/';
            else
            {
                if ($part[0] != '{')
                    $parsed['pattern'] .= $part . '\\/';
                else if ($part[1] != '?')
                    $parsed['pattern'] .= '([\x{0020}-\x{002E} \x{0030}-\x{FFFF}]*)\\/';
    //$parsed['pattern'] .= '([\!\w\- =%0-9\.\(\)\,\"\']*)\\/';
                $parsed['params'][] = substr($part, 1, -1);
                $parsed['par'][$part[1] != '?' ? 'needed' : 'optional'][] = substr($part, 1 + ($part[1] != '?' ? 1 : 0), -1);
            }
        $parsed['pattern'] .= '$#u';
        //if($uri == '/mpd/artist/{albums}') die(print_r($parsed));
        return $parsed;
    }

    // recupere l'url et determine le controller et l'action a appeler
    static public function dispatch()
    {
        $request = Url::getURI();
        $method  = Request::getMethod();
        foreach (self::$routes[$method] as $route)
        {
            preg_match($route['pattern'], $request, $params);
            if (isset($params[0]))
            {
                unset($params[0]);
                $controller = $route['controller'];
                $action = $route['action'];
                $class = new $controller();
                call_user_func_array([$class, $action], $params);
                die;
            }
        }
        die;
    }
}
