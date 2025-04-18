from storages.backends.s3boto3 import S3Boto3Storage

class AvatarStorage(S3Boto3Storage):
    location = "media"
    file_overwrite = False


class ResumeStorage(S3Boto3Storage):
    location = "resumes"
    file_overwrite = False