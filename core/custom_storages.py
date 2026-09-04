from storages.backends.s3 import S3Storage

class MediaStorage(S3Storage):
    location = 'uploads'  # Sous-dossier optionnel dans votre bucket
    file_overwrite = False