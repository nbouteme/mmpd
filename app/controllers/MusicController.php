<?php

class MusicController
{
    public function currentImage()
    {
        $data = Music::image($_SESSION['playing']);
        header('Content-Type: ' . $data['type']);
        echo $data['data'];
    }

    public function fallback()
    {
        header("HTTP/1.0 404 Not Found");
    }
}
