<?php
$out = shell_exec('printenv | cut -d= -f1 2>&1');
echo '<pre>' . htmlspecialchars($out, ENT_QUOTES, 'UTF-8') . '</pre>';
