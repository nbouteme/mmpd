<?php

class MainController
{

    public function fallback()
    {
        header("HTTP/1.0 404 Not Found");
    }
}
