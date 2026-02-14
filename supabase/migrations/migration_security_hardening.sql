-- Secure Profiles Table
-- Drop the overly permissive public read policy
drop policy "Public profiles are viewable by everyone." on profiles;

-- Create a new restrictive policy (Users can only see their own profile)
create policy "Users can only view their own profile."
  on profiles for select
  using ( auth.uid() = id );

-- Secure Storage (Avatars)
-- Drop the loose authenticated policies
drop policy "Anyone can upload an avatar." on storage.objects;
drop policy "Anyone can update their own avatar." on storage.objects;

-- Create stricter policies enforcing folder/filename ownership
-- Allow upload only if the filename starts with the user's ID
create policy "Users can only upload their own avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] like (auth.uid() || '%')
  );

-- Allow update only if the filename starts with the user's ID
create policy "Users can only update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] like (auth.uid() || '%')
  );

-- Allow delete only if the filename starts with the user's ID (good practice)
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] like (auth.uid() || '%')
  );
