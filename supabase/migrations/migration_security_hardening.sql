-- Drop previous policies to avoid conflicts
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Profiles are viewable by authenticated users." on profiles;
drop policy if exists "Users can view relevant profiles" on profiles;

-- Create a scoped policy for privacy
create policy "Users can view relevant profiles" 
on profiles for select 
to authenticated
using (
    -- 1. Own profile
    id = auth.uid() 
    
    OR 
    
    -- 2. Friends (Either side of friendship)
    exists (
        select 1 from friendships 
        where (user_id = auth.uid() and friend_id = profiles.id) 
           or (friend_id = auth.uid() and user_id = profiles.id)
    )
    
    OR 
    
    -- 3. Group Members (Shared Groups)
    exists (
        select 1 from group_members gm1
        join group_members gm2 on gm1.group_id = gm2.group_id
        where gm1.user_id = auth.uid() and gm2.user_id = profiles.id
    )
);

-- Secure Storage (Avatars)
-- Drop the loose authenticated policies
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;
drop policy if exists "Users can only upload their own avatar." on storage.objects;
drop policy if exists "Users can only update their own avatar." on storage.objects;
drop policy if exists "Users can delete their own avatar." on storage.objects;

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
