<?php
shell_exec('export COMPOSER_HOME=/home/nbobimkb/public_html/ozan.my.id/composer.phar');
$out = shell_exec('cd .. && php composer.phar install --no-dev --optimize-autoloader 2>&1');
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <pre>
        <?php echo htmlspecialchars($out, ENT_QUOTES, 'UTF-8'); ?>
    </pre>
</body>

</html>