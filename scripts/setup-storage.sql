-- Setup Supabase Storage for Campaign Images
-- Run this in your Supabase SQL Editor

-- Create storage bucket for campaign images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-images',
  'campaign-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public access to campaign images
CREATE POLICY "Public Access to Campaign Images" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Users Can Upload Images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded images
CREATE POLICY "Users Can Update Own Images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users Can Delete Own Images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
SELECT 'Storage bucket "campaign-images" created successfully with public access policies!' as status;
