<?php
// Download composer installer
shell_exec('php -r "copy(\'https://getcomposer.org/installer\', \'composer-setup.php\');"');
echo "Composer installer downloaded!<br>";

// Jalankan installer
shell_exec('php composer-setup.php');
echo "Composer installed!<br>";

// Hapus file setup
shell_exec('php -r "unlink(\'composer-setup.php\');"');
echo "Setup file deleted!<br>";

// Cek hasilnya
echo shell_exec('php composer.phar --version');
