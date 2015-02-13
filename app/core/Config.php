<?php

// Pour lire et acceder a la configuration
class Config
{
    static private $config;

    static public function load()
    {
        self::$config = parse_ini_file('app/Config.ini', true);
    }

    static public function get($value)
    {
        $section = explode('.', $value)[0];
        $key = explode('.', $value)[1];
        return isset(self::$config[$section][$key]) ? self::$config[$section][$key] : null;
    }
}
