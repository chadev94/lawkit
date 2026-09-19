-- section-media: 히어로 등 배경 영상(mp4/webm) 허용
-- 기존: 이미지 4종 · 5MB → 이미지 + video/mp4 · video/webm · 20MB

update storage.buckets
set
  file_size_limit = 20971520,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
where id = 'section-media';
