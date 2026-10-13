drop policy if exists "fotos lectura" on storage.objects;
create policy "fotos lectura auth" on storage.objects for select to authenticated using (bucket_id = 'fotos');