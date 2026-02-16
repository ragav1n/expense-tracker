-- Set file size limit for avatars bucket to 10MB (10 * 1024 * 1024 bytes)
update storage.buckets
set file_size_limit = 10485760
where id = 'avatars';
