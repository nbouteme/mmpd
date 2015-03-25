<?php

class Music
{
    private static $cache = array();
    private static $dirty = true;

    public static function save($fn)
    {
        self::$cache[md5($fn)] = $fn;
        $buf2 = serialize(self::$cache);
        file_put_contents('app/cache/coverDb', $buf2);

        if(!file_exists('app/cache/' . md5($fn) . '.json'))
        {
            ob_start();
            passthru('ffprobe -v quiet ' . escapeshellarg($fn) . ' -of json -show_format');
            $buf = ob_get_clean();
            file_put_contents('app/cache/' . md5($fn) . '.json', $buf);            
        }

    }

    public static function tags($fn)
    {
        if(!isset(self::$cache[md5($fn)]))
            self::save($fn);

        if(file_exists('app/cache/coverDb'))
        {
            self::$cache = file_get_contents('app/cache/coverDb');
            self::$cache = unserialize(self::$cache);
            self::save($fn);
            $buf = file_get_contents('app/cache/' . md5($fn) . '.json');
        }

        $ret = json_decode($buf, true)['format'];
        $ret['tags'] = array_change_key_case($ret['tags']);
        $ret['tags']['coverId'] = md5($fn);

        return $ret['tags'];
    }
    
    public static function image($fn)
    {
        if(!file_exists($fn)) die('File not Found');
        $h = md5($fn);// c drol pask h se prononce hash
        if(file_exists('app/cache/' . $h))
        {
            ob_start();
            include "app/cache/$h";
            $buf = ob_get_contents();
            ob_end_clean();
        }
        else
        {
            ob_start();
            passthru('ffmpeg -i ' . escapeshellarg($fn) . ' -f image2pipe -');
            $buf = ob_get_clean();
            $fd = fopen("app/cache/$h", 'w');
            fwrite($fd, $buf);
            fclose($fd);
        }

        $finfo = new finfo(FILEINFO_MIME);
        $type = $finfo->buffer($buf);
        return array('type' => $type, 'data' => $buf);
    }

    public static function formatData($fn)
    {
        ob_start();
        passthru('ffprobe -of json ' . escapeshellarg1($fn) .' -hide_banner -show_format -pretty -v quiet');
        $buf = ob_get_clean();
        return json_decode($buf, true);
    }

    public static function imageFromId($id)
    {
        if(self::$cache == null && file_exists('app/cache/coverDb'))
            self::$cache = unserialize(file_get_contents('app/cache/coverDb'));
        return self::image(self::$cache[$id]);
    }  
}

?>