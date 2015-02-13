<?php

class Auth
{
    public static function validate($id, $password)
    {
        if(!Users::exists($id) || !Users::isvalid($id)) return false;
        if(password_verify($password, Users::getPassword($id)))
        {
            $_SESSION['user'] = Users::getUsername($id);
            return true;
        }

        return false;
    }

    public static function isLoggedIn()
    {
        return isset($_SESSION['user']);
    }
}
