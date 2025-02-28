<?php
$user_info = posix_getpwuid(posix_geteuid());
echo $user_info['dir']; // Contoh output: /home/username
