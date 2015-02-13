<?php

class Music
{
    private static $cache = null;
    private static $dirty = true;

    public static function tags($fn)
    {
        ob_start();

        passthru('ffprobe -v quiet \'' . $fn . '\' -of json -show_format', $i);
        $buf = ob_get_clean();
        $ret = json_decode($buf, true)['format'];
        if(self::$dirty || file_exists('app/cache/coverDb'))
        {
            self::$cache = file_get_contents('app/cache/coverDb');
            self::$cache = unserialize(self::$cache);
            self::$cache[md5($fn)] = $fn;
            self::$dirty = false;
        }
        else
        {
            self::$cache = array();
            self::$cache[md5($fn)] = $fn;
            self::$dirty = true;
        }
        $buf2 = serialize(self::$cache);
        file_put_contents('app/cache/coverDb', $buf2);

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
            passthru('ffmpeg -i \'' . $fn . '\' -f image2pipe -');
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
        passthru('ffprobe -of json \'' . $fn .'\' -hide_banner -show_format -pretty -v quiet');
        $buf = ob_get_clean();
        return json_decode($buf, true);
    }

    public static function imageFromId($id)
    {
        if(self::$cache == null && file_exists('app/cache/coverDb'))
        {
            self::$cache = file_get_contents('app/cache/coverDb');
            self::$cache = unserialize(self::$cache);
        }
        return self::image(self::$cache[$id]);
    }  
}

?>