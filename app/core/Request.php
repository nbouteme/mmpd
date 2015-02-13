<?php

class Request
{
    static public function getMethod()
    {
        return (isset($_POST['_method']) && in_array($_POST['_method'], self::$authorizedMethods)) ? $_POST['_method'] : $method = $_SERVER['REQUEST_METHOD'];
    }
}