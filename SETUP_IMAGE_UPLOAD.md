# Image Upload Setup Guide

The image upload feature has been fully implemented! Here's what you need to do to complete the setup:

## 1. Create the Storage Bucket in Supabase

You need to run the migration SQL in your Supabase dashboard to create the storage bucket and set up proper security policies.

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/20251108000001_create_property_images_storage.sql`
6. Click **Run** (or press Ctrl+Enter)

The migration will:
- Create a public `property-images` storage bucket
- Set a 10MB file size limit
- Allow only image file types (JPEG, PNG, WEBP, GIF)
- Set up Row Level Security (RLS) policies so:
  - Anyone can view images
  - Authenticated users can upload images
  - Users can only modify/delete images for properties they own

## 2. What's Been Implemented

### Components Created:
- **`components/properties/image-upload.tsx`** - Drag-and-drop image upload component with:
  - File validation (type and size)
  - Drag and drop support
  - Image previews with order indicators
  - Remove button for each image
  - Max 15 images, 10MB each

- **`components/properties/property-form.tsx`** - Client-side property form that:
  - Integrates all form fields
  - Handles image uploads after property creation
  - Shows loading states and toast notifications

### API Endpoints:
- **`app/api/properties/[id]/images/route.ts`** - Handles:
  - POST: Upload multiple images to Supabase Storage
  - DELETE: Remove images from storage and database
  - Authentication and ownership verification

### Hooks:
- **`lib/hooks/use-image-upload.ts`** - Custom hook for:
  - Upload state management
  - Progress tracking
  - Error handling

### Modified Files:
- **`app/properties/new/page.tsx`** - Updated to use new PropertyForm component
- **`app/api/properties/create/route.ts`** - Returns JSON instead of redirect for better client-side handling

## 3. How It Works

1. User fills out the property form
2. User drags and drops or selects images (up to 15)
3. User clicks "Create Listing"
4. Property is created in the database
5. Images are uploaded to Supabase Storage
6. Database records are created in `property_images` table
7. User is redirected to the property page

## 4. Features

- ✅ Drag and drop support
- ✅ File type validation (images only)
- ✅ File size validation (max 10MB per image)
- ✅ Image previews with thumbnails
- ✅ Order indicators (#1, #2, etc.)
- ✅ Remove button per image
- ✅ Loading states during upload
- ✅ Toast notifications for success/errors
- ✅ First image is marked as "Main Photo"
- ✅ Security: Only property owners can modify/delete their images
- ✅ Public access: Anyone can view property images

## 5. Testing

Once you've run the migration:

1. Navigate to http://localhost:3002/properties/new
2. Fill out the property form
3. Drag and drop some images or click to browse
4. Click "Create Listing"
5. Watch the toast notifications
6. You should be redirected to the property page with your images displayed

## 6. Troubleshooting

If images aren't uploading:
- Check that the migration was run successfully
- Check the browser console for errors
- Verify the storage bucket exists in Supabase Dashboard > Storage
- Check that RLS policies are enabled on the bucket

If you get permission errors:
- Verify you're logged in
- Check that the property belongs to your user account
- Review the RLS policies in the migration file
