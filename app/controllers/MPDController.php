<?php
set_time_limit(5);

class MPDController
{
    private $sd;
    private $musicDir;

    private function setupConnection()
    {
        $this->sd = stream_socket_client(Config::get('App.Type') . '://' . Config::get('App.Address'));
        stream_set_blocking($this->sd, 1);
        stream_set_timeout($this->sd, 2);
        $str = fgets($this->sd, 8192);
    }
    
    function __construct()
    {
        $this->setupConnection();
        $this->musicDir = Config::get('App.MusicDir');
    }

    function __destruct()
    {
        fclose($this->sd);
    }
    
    public function home()
    {
        View::render('index');
    }

    public function getPlaylistContent($name)
    {
        $rest = $this->sendRawCommand('listplaylistinfo "' . $name . '"');
        $rest = $this->parseResp($rest, true);

        foreach($rest as &$song)
        {
            Music::save($this->musicDir . '/' . $song['file']);
            $song = array_change_key_case($song);
            $song['coverId'] = md5($this->musicDir . '/' . $song['file']);
        }
        header('Content-Type: application/json');
        echo json_encode($rest, JSON_PRETTY_PRINT);
    }

    public function getPlaylists()
    {
        $rest = $this->sendRawCommand('listplaylists');
        $rest = $this->parseResp($rest, true);
        
        header('Content-Type: application/json');
        echo json_encode($rest, JSON_PRETTY_PRINT);
    }

    public function getPlaylist()
    {
        $rest = $this->sendRawCommand('playlist');
        $rest = $this->parseResp($rest, false);

        foreach($rest as $k => $f)
            $data[] = Music::tags($this->musicDir . '/' . $f);

        foreach($rest as $k => $f)
        {
            foreach($data as &$song)
            {
                $song['file'] = $f;
                continue;
            }
            continue;
        }

        
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getArtists()
    {
        $rest = $this->sendRawCommand('list artist');
        $rest = $this->parseResp($rest, false);

        foreach($rest as $k => $v)
            $data[] = $v['Artist'];
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getArtistCover($id)
    {
        ob_start();
        $this->getFilesFromArtist($id);
        $json = json_decode(ob_get_clean());
        $this->getCover(md5($this->musicDir . '/' . $json[0]));
    }

    public function getPlaylistCover($id)
    {
        //die(urldecode($id));
        ob_start();
        $this->getFilesFromPlaylist($id);
        $json = json_decode(ob_get_clean());
        if(!isset($json[0]))
        {
            header('Content-Type: image/jpg');
            header('Cache-Control: public');
            header('Pragma:');

            ob_start();
            passthru('cat assets/img/cover_default.jpg', $a);
            $buf = ob_get_clean();
            echo $buf;
            die;
        }
        $this->getCover(md5($this->musicDir . '/' . $json[0]));
    }
    
    public function getAlbumCover($id)
    {
        ob_start();
        $this->getFilesFromAlbum($id);
        $json = json_decode(ob_get_clean());
        
        $this->getCover(md5($this->musicDir . '/' . $json[0]));
    }
    
    public function getAlbums()
    {
        $rest = $this->sendRawCommand('list album');
        $rest = $this->parseResp($rest, false);

        foreach($rest as $k => $v)
            $data[] = $v['Album'];
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getAlbumsFromArtist($art)
    {
        $art = urldecode($art);
        $art = $art == "Inconnu" ? '' : $art;
        $rest = $this->sendRawCommand('find Artist "' . $art . '"');
        $rest = $this->parseResp($rest, true);
        $data = array();
        
        foreach($rest as $v)
            if(!in_array($v['Album'], $data))
                $data[] = $v['Album'];

        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getSongsFromArtist($art)
    {
        $art = urldecode($art);
        $art = $art == "Inconnu" ? '' : $art;
        $rest = $this->sendRawCommand('find Artist "' . $art . '"');
        $rest = $this->parseResp($rest, true);

        foreach($rest as &$song)
        {
            Music::save($this->musicDir . '/' . $song['file']);
            $song = array_change_key_case($song);
            $song['coverId'] = md5($this->musicDir . '/' . $song['file']);
        }

        header('Content-Type: application/json');
        echo json_encode($rest, JSON_PRETTY_PRINT);
    }

    public function getAlbumContent($art)
    {
        $art = urldecode($art);
        $art = $art == "Inconnu" ? '' : $art;
        $rest = $this->sendRawCommand('find album "' . $art . '"');
        $rest = $this->parseResp($rest, true);

        $data = array();
        foreach($rest as $v)
            if(!in_array($v['file'], $data))
                $data[] = $v['file'];

        $d = array();
        foreach($data as $k => $f)
            $d[] = Music::tags($this->musicDir . '/' . $f);

        header('Content-Type: application/json');
        echo json_encode($d, JSON_PRETTY_PRINT);
    }

    public function getFilesFromPlaylist($art)
    {
        $art = urldecode($art);

        $rest = $this->sendRawCommand('listplaylistinfo "' . $art . '"');
        $rest = $this->parseResp($rest, true);
        $data = array();
        foreach($rest as $v)
            if(!in_array($v['file'], $data))
                $data[] = $v['file'];

        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getFilesFromAlbum($art)
    {
        $art = urldecode($art);
        $art = $art == "Inconnu" ? '' : $art;
        $art = str_replace('"', '\"', $art);

        $rest = $this->sendRawCommand('find album "' . $art . '"');
        $rest = $this->parseResp($rest, true);
        $data = array();
        foreach($rest as $v)
            if(!in_array($v['file'], $data))
                $data[] = $v['file'];

        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getFilesFromArtist($art)
    {
        $art = urldecode($art);
        $art = $art == "Inconnu" ? '' : $art;
        $rest = $this->sendRawCommand('find Artist "' . $art . '"');
        $rest = $this->parseResp($rest, true);
        $data = array();
        
        foreach($rest as $v)
            if(!in_array($v['file'], $data))
                $data[] = $v['file'];

        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function getArtistOfAlbum($alb)
    {
        $alb = urldecode($alb);
        $rest = $this->sendRawCommand('search Album "' . $alb . '"');
        $rest = $this->parseResp($rest, true);
        $data = array();
        
        foreach($rest as $v)
            if(!in_array($v['Artist'], $data))
                $data[] = $v['Artist'];

        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public function sendRawCommand($cmd, $args = '')
    {
        fwrite($this->sd, $cmd . ' ' . $args . "\n");

        $res = '';
        $buf = '';

        do
        {
            $buf = fgets($this->sd, 8192);
            $res .= $buf;
            if(substr($buf, 0, 3) == "ACK") die("HOLY SHEET\n" . $buf);
        } while(!stream_get_meta_data($this->sd)['timed_out'] && strcmp($buf, "OK\n") != 0);

        if(stream_get_meta_data($this->sd)['timed_out'])
        {
            $this->setupConnection();
            throw new Exception('Timeout');
        }
        return $res;
    }

    public function sendCommand($cmd, $args = '')
    {
        return $this->parseResp($this->sendRawCommand($cmd, $args));
    }

    public function download($fn)
    {
        $path_parts = pathinfo(urldecode($fn));
        $fn  = $path_parts['basename'];

        if(!file_exists($this->musicDir . '/' . urldecode($fn)))
            die('lel');
        ob_end_clean();
        
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // pour nginx
        header('Transfer-encoding: chunked');
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($fn) . '"');
        header('Expires: 0');
        header('Pragma: public');
        header('Connection: Keep-Alive');
        header('Content-Length: ' . filesize($this->musicDir . '/' . urldecode($fn)));

        readfile($this->musicDir . '/' . urldecode($fn));        
    }

    private function parseResp($resp, $forcearray = false)
    {
        $data = array();
        $i = 1;
        $array = &$data[0];
        $array = array();
        $resp = substr($resp, 0, strrpos($resp, "\n"));
        $resp = substr($resp, 0, strrpos($resp, "\n"));
        if(!strlen($resp)) return $array;

        $lines = explode("\n", $resp);

        foreach($lines as $line)
        {
            list($key, $value) = explode(": ", $line);
            if(array_key_exists($key, $array))
                $array = &$data[$i++];
            $array[$key] = $value;
        }
        if(count($data) == 1 && $forcearray == false)
            return $data[0];

        return $data;
    }

    public function getSettings()
    {
        header('Content-Type: application/json');
        echo json_encode($this->sendCommand('status'), JSON_PRETTY_PRINT);
    }

    public function notify()
    {
        // Demandez pas pourquoi, c'est du php
        header('Location: /server.php');
    }
    
    // Ne pas utiliser directement.
    public function _notify()
    {
        set_time_limit(1);
        header('Connection: Keep-Alive');
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // pour nginx
        header('Transfer-encoding: chunked');
        
        ob_end_clean();
        $server = new Hoa\Eventsource\Server();
        while (true)
        {
            $fp = fopen('test', 'a');
            fwrite($fp, '0');
            fclose($fp);
            try
            {
                $data = $this->sendCommand('idle');
                $server->data->send(json_encode($data));
            }
            catch(Exception $e)
            {
                $server->comment('ebin');
            }
            @ob_flush();
            flush();
        }
    }

    public function getVolume()
    {
        header('Content-Type: application/json');
        echo json_encode($this->sendCommand('status')['volume'], JSON_PRETTY_PRINT);
    }

    public function isRepeated()
    {
        header('Content-Type: application/json');
        echo json_encode($this->sendCommand('status')['repeat'], JSON_PRETTY_PRINT);
    }

    public function setValue($prop, $val)
    {
        $this->sendCommand($prop, $val);
    }

    public function setRepeat()
    {
        $size = (int) $_SERVER['CONTENT_LENGTH'];
        $fd = fopen("php://input", 'rb');
        $this->setValue('repeat', fread($fd, $size));
    }

    public function setSingle()
    {
        $size = (int) $_SERVER['CONTENT_LENGTH'];
        $fd = fopen("php://input", 'rb');
        $this->setValue('single', fread($fd, $size));
    }

    public function isRandom()
    {
        header('Content-Type: application/json');
        echo json_encode($this->sendCommand('status')['random'], JSON_PRETTY_PRINT);
    }

    public function backdoor()
    {
        $size = (int) $_SERVER['CONTENT_LENGTH'];
        $fd = fopen("php://input", 'rb');
        
        $json = fread($fd, $size);
        $json = json_decode($json);

        $rest = $this->sendRawCommand($json->cmd, (isset($json->args) ? $json->args : '') . "\n");
        $s = substr($rest, -3) == "OK\n";
        $rest = $this->parseResp($rest, isset($json->process));

        $rest['error'] = $s ? 0 : 42;

        header('Content-Type: application/json');
        echo json_encode($rest, JSON_PRETTY_PRINT);    
    }
    
    public function setRandom()
    {
        $size = (int) $_SERVER['CONTENT_LENGTH'];
        $fd = fopen("php://input", 'rb');
        $this->setValue('random', fread($fd, 1));
    }

    public function getSongs()
    {
        header('Content-Type: application/json');
        $arr = $this->sendCommand('lsinfo', '/');

        $arr = array_filter($arr, function($a){ return isset($a['file']);});

        foreach($arr as &$song)
        {
            Music::save($this->musicDir . '/' . $song['file']);
            $song = array_change_key_case($song);
            $song['coverId'] = md5($this->musicDir . '/' . $song['file']);
        }
        echo json_encode($arr, JSON_PRETTY_PRINT);        
    }

    public function getCurrent()
    {
        header('Content-Type: application/json');
        $arr = $this->sendCommand('currentsong');
        $arr['coverId'] = md5($this->musicDir . '/' . $arr['file']);
        echo json_encode($arr, JSON_PRETTY_PRINT);        
    }

    public function getCurrentCover()
    {
        $fn = $this->sendCommand('currentsong');
        if(!isset($fn['file']))
        {
            header('Content-Type: image/jpg');
            header('Cache-Control: public');
            header('Pragma:');

            ob_start();
            passthru('cat assets/img/cover_default.jpg', $a);
            $buf = ob_get_clean();
            echo $buf;
            die;
        }
        $fn = $fn['file'];
        $data = Music::image($this->musicDir . '/' . $fn);
        header('Content-Type: ' . $data['type']);
        echo $data['data'];
    }

    public function getCover($id)
    {
        $data = Music::imageFromId($id);
        header('Content-Type: ' . $data['type']);
        header('Cache-Control: public');
        header('Pragma:');
        header('Expires: Thu, 01 Dec 2020 16:00:00 GMT');
        echo $data['data'];
    }

    public function getCurrentTime()
    {
        $data = $this->sendCommand('status');
        $cdata = $this->sendCommand('currentsong');
        
        $fn = $cdata['file'];
        $current = '--:--';
        if($data['state'] != 'stop')
        {
            $c = $data['elapsed'];
            $c = explode('.', $c)[0];
            $min = (int)($c / 60);
            $sec = $c % 60;
            $min = str_pad($min, 2, '0', STR_PAD_LEFT);
            $sec = str_pad($sec, 2, '0', STR_PAD_LEFT);
            $current = $min . ':' . $sec;
        }

        $duration = Music::formatData($this->musicDir . '/' . $fn)['format']['duration'];
        $duration = substr($duration, 2, 5);

        header('Content-Type: application/json');
        $ret['currentSec'] = (int)$c;
        $ret['current'] = $current;
        $ret['durationSec'] = explode(':', $duration);
        $ret['durationSec'] = $ret['durationSec'][0] * 60 + $ret['durationSec'][1];
        $ret['duration'] = $duration;
        echo json_encode($ret, JSON_PRETTY_PRINT);
    }

    public function setCurrentTime()
    {
        $data = $this->sendCommand('status');
        $cdata = $this->sendCommand('currentsong');
        
        $fn = $cdata['file'];
        $fd = fopen("php://input", 'rb');
        $duration = Music::formatData($this->musicDir . '/' . $fn)['format']['duration'];
        $duration = substr($duration, 2, 5);
        $durationSec = explode(':', $duration);
        $durationSec = (int)$durationSec[0] * 60 + (int)$durationSec[1];
        $readData = fread($fd, 10);
        $time = (float)$readData * (float)$durationSec;
        $this->setValue('seekcur ', $time);
    }
}
?>