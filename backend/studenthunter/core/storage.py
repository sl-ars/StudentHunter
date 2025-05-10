from storages.backends.s3boto3 import S3Boto3Storage


class PublicAssetStorage(S3Boto3Storage):
    location = "public-assets"
    default_acl = "public-read"
    file_overwrite = False
