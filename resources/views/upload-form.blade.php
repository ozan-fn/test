<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload dan Lihat File</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <div class="card mb-4">
                    <div class="card-header">
                        <h4>Upload File</h4>
                    </div>
                    <div class="card-body">
                        @if (session('success'))
                            <div class="alert alert-success">
                                {{ session('success') }}
                            </div>
                        @endif

                        @if (session('error'))
                            <div class="alert alert-danger">
                                {{ session('error') }}
                            </div>
                        @endif

                        <form action="{{ route('upload.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="mb-3">
                                <label for="file" class="form-label">Pilih File</label>
                                <input type="file" name="file" id="file"
                                    class="form-control @error('file') is-invalid @enderror">
                                @error('file')
                                    <div class="invalid-feedback">
                                        {{ $message }}
                                    </div>
                                @enderror
                            </div>
                            <button type="submit" class="btn btn-primary">Upload</button>
                        </form>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h4>Daftar File</h4>
                    </div>
                    <div class="card-body">
                        @if (count($files) > 0)
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama File</th>
                                            <th>Ukuran</th>
                                            <th>Jenis File</th>
                                            <th>Tanggal Upload</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($files as $index => $file)
                                            <tr>
                                                <td>{{ $index + 1 }}</td>
                                                <td>{{ $file->name }}</td>
                                                <td>{{ $file->formatSize() }}</td>
                                                <td>{{ $file->mime_type }}</td>
                                                <td>{{ $file->created_at->format('d M Y H:i') }}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <a href="{{ route('upload.show', $file->id) }}"
                                                            class="btn btn-sm btn-info">Detail</a>
                                                        <a href="{{ route('upload.download', $file->id) }}"
                                                            class="btn btn-sm btn-success">Download</a>
                                                        <form action="{{ route('upload.destroy', $file->id) }}"
                                                            method="POST"
                                                            onsubmit="return confirm('Yakin ingin menghapus file ini?')">
                                                            @csrf
                                                            @method('DELETE')
                                                            <button type="submit"
                                                                class="btn btn-sm btn-danger">Hapus</button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @else
                            <div class="alert alert-info">
                                Belum ada file yang diupload.
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
