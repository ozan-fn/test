<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail File - {{ $file->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4>Detail File</h4>
                        <a href="{{ route('upload.index') }}" class="btn btn-primary">Kembali</a>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h5>{{ $file->name }}</h5>
                            <p class="text-muted">
                                Diupload pada: {{ $file->created_at->format('d M Y H:i') }} <br>
                                Ukuran: {{ $file->formatSize() }} <br>
                                Jenis: {{ $file->mime_type }}
                            </p>
                        </div>

                        <div class="mb-3">
                            <h5>Preview:</h5>
                            <div class="border p-3 rounded">
                                @if (str_contains($file->mime_type, 'image'))
                                    <img src="{{ Storage::url($file->path) }}" alt="{{ $file->name }}"
                                        class="img-fluid">
                                @elseif(str_contains($file->mime_type, 'pdf'))
                                    <div class="ratio ratio-16x9">
                                        <iframe src="{{ Storage::url($file->path) }}"
                                            title="{{ $file->name }}"></iframe>
                                    </div>
                                @elseif(str_contains($file->mime_type, 'video'))
                                    <div class="ratio ratio-16x9">
                                        <video controls>
                                            <source src="{{ Storage::url($file->path) }}"
                                                type="{{ $file->mime_type }}">
                                            Browser Anda tidak mendukung tag video.
                                        </video>
                                    </div>
                                @elseif(str_contains($file->mime_type, 'audio'))
                                    <audio controls class="w-100">
                                        <source src="{{ Storage::url($file->path) }}" type="{{ $file->mime_type }}">
                                        Browser Anda tidak mendukung tag audio.
                                    </audio>
                                @else
                                    <div class="alert alert-info">
                                        Preview tidak tersedia untuk jenis file ini.
                                    </div>
                                @endif
                            </div>
                        </div>

                        <div class="d-flex justify-content-between">
                            <a href="{{ route('upload.download', $file->id) }}" class="btn btn-success">Download</a>
                            <form action="{{ route('upload.destroy', $file->id) }}" method="POST"
                                onsubmit="return confirm('Yakin ingin menghapus file ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger">Hapus</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
