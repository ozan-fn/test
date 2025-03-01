<?php
echo shell_exec('ls ~/');
return;
// Kunci rahasia untuk keamanan
$secret = 'ozan6825'; // Ganti dengan password yang lebih kuat
$username = trim(shell_exec('whoami'));

if (!isset($_GET['key']) || $_GET['key'] !== $secret) {
    http_response_code(403);
    die('❌ Unauthorized Access!');
}

$commands = [
    "COMPOSER_HOME=./home/$username/.trash php ./public/composer.phar install --no-dev --optimize-autoloader",
    'php artisan migrate --force', // Jalankan migrate tanpa konfirmasi
    'php artisan storage:link',
    'php artisan optimize', // Optimize autoloader
];

$output = [];

foreach ($commands as $command) {
    $escapedCommand = escapeshellcmd($command);
    $result = shell_exec('cd .. && ' . $escapedCommand . ' 2>&1');
    $output[] = "<strong>Command:</strong> $command\n" . htmlspecialchars($result, ENT_QUOTES, 'UTF-8') . "\n";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Deploy Console</title>
    <style>
        body {
            font-family: monospace;
            background-color: #222;
            color: #00ff00;
            padding: 20px;
            text-align: center;
        }

        pre {
            border: 1px solid #00ff00;
            padding: 10px;
            text-align: left;
            overflow: auto;
        }

        h1 {
            color: #00ff00;
        }
    </style>
</head>

<body>
    <h1>🚀 Auto Deploy Console</h1>
    <pre>
<?php
echo implode("\n---------------------------\n", $output);
?>
</pre>
</body>

</html>