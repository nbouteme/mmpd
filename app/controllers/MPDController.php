<?php
set_time_limit(5);

class MPDController
{
    private $sd;
    private $musicDir;
    
    function __construct()
    {
        $this->sd = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_connect($this->sd, "localhost", 6600);
        socket_read($this->sd, 40);
        $this->musicDir = Config::get('App.MusicDir');
    }

    public function home()
    {
        View::render('index');
    }

    public function getPlaylist()
    {
        $rest = $this->sendRawCommand('playlist');
        $rest = $this->parseResp($rest, false);
        
        foreach($rest as $k => $f)
            $data[] = Music::tags($this->musicDir . '/' . $f);
        
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }
    
    public function sendRawCommand($cmd, $args = '')
    {
        socket_write($this->sd, $cmd . ' ' . $args . "\n");

        $res = '';
        $buf = '';

        do
        {
            $buf = socket_read($this->sd, 1);
            $res .= $buf;
        } while(strcmp(substr($res, -3), "OK\n"));

        return $res;
    }

    public function sendCommand($cmd, $args = '')
    {
        return $this->parseResp($this->sendRawCommand($cmd, $args));
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
        set_time_limit(5);
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // pour nginx
        header('Connection: Keep-Alive');

        ob_end_clean();

        while (true)
        {
            $data = $this->sendCommand('idle');
            echo "data: " . json_encode($data) . "\n\n";
            @ob_flush();
            flush();
        }
        die;
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
        $this->setValue('repeat', fread($fd, 1));
    }

    public function isRandom()
    {
        header('Content-Type: application/json');
        echo json_encode($this->sendCommand('status')['random'], JSON_PRETTY_PRINT);
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
        foreach($arr as &$song)
            $song['coverId'] = md5($this->musicDir . '/' . $song['file']);
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
        $fn = $this->sendCommand('currentsong')['file'];
        $data = Music::image($this->musicDir . '/' . $fn);
        header('Content-Type: ' . $data['type']);
        echo $data['data'];
    }

    public function getCover($id)
    {
        $data = Music::imageFromId($id);
        header('Content-Type: ' . $data['type']);
        echo $data['data'];
    }

    public function getCurrentTime()
    {
        $data = $this->sendCommand('status');
        $cdata = $this->sendCommand('currentsong');
        if(empty($data) || empty($cdata))
        {
            die('sdf');
        }
        
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
        if(empty($data) || empty($cdata))
        {
            die('sdf');
        }
        
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