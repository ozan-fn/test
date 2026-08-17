<?= view('partials/header') ?>
<h1><?= $user ? 'Edit' : 'Tambah' ?> User</h1>
<form method="post" action="<?= $user ? '/update/' . $user['id'] : '/store' ?>">
    <label>Name: <input type="text" name="name" value="<?= $user['name'] ?? '' ?>" required></label><br>
    <label>Email: <input type="email" name="email" value="<?= $user['email'] ?? '' ?>" required></label><br>
    <button>Simpan</button>
</form>
<a href="/">Kembali</a>
<?= view('partials/footer') ?>