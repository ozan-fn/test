<?php
// Path relatif ke composer.phar
$composerPath = realpath(__DIR__ . '/../composer.phar');

// Pastikan path composer.phar ada dan valid
if ($composerPath) {
    // Menyiapkan perintah untuk menjalankan Composer di dalam satu shell
    $command = "export COMPOSER_HOME=$PWD && php $composerPath install --no-dev --optimize-autoloader";

    // Escape command untuk shell_exec
    $escapedCommand = escapeshellcmd($command);

    // Jalankan perintah dengan shell_exec dari folder satu level atas
    $out = shell_exec('cd .. && ' . $escapedCommand . ' 2>&1');

    // Menampilkan output perintah
    echo "<pre>$out</pre>";
} else {
    echo "Composer tidak ditemukan di lokasi yang diharapkan.";
}
