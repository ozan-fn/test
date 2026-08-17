<?= view('partials/header') ?>
<h1>Users</h1>
<a href="/create">Tambah</a>
<table border="1" cellpadding="6">
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Dibuat</th><th>Diupdate</th><th>Aksi</th></tr>
    <?php foreach ($users as $u): ?>
    <tr>
        <td><?= $u['id'] ?></td>
        <td><?= esc($u['name']) ?></td>
        <td><?= esc($u['email']) ?></td>
        <td><?= $u['created_at'] ?></td>
        <td><?= $u['updated_at'] ?></td>
        <td>
            <a href="/edit/<?= $u['id'] ?>">Edit</a>
            <form method="post" action="/delete/<?= $u['id'] ?>" style="display:inline">
                <button onclick="return confirm('Hapus?')">Hapus</button>
            </form>
        </td>
    </tr>
    <?php endforeach; ?>
</table>
<?= view('partials/footer') ?>