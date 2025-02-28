<?php
$username = trim(shell_exec('whoami'));
echo "/home/$username";
