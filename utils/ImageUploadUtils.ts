import { ImageUploadResult } from "../models/ViewModel_Models";


import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

/**
 * Handles the profile photo upload process.
 * Requests permissions, opens image picker, and optionally saves the image locally.
 * @param saveLocally Whether to save the image to local storage (default: true)
 * @returns Promise with the result containing the image path/URI
 */
export async function handleProfilePhotoUpload(saveLocally: boolean = true): Promise<ImageUploadResult> {
    try {
        // --- 1. Request permissions ---
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.status !== 'granted') {
            return {
                status: 'error',
                message: 'Permission to access media library is required!',
            };
        }

        // --- 2. Launch image picker ---
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio for profile photos
            quality: 0.8, // Reduce file size while maintaining good quality
            base64: false, // We don't need base64 for file operations
        });

        if (pickerResult.canceled) {
            return {
                status: 'cancelled',
                message: 'Image selection was cancelled',
            };
        }

        const selectedImage = pickerResult.assets[0];

        if (!saveLocally) {
            // Return the temporary URI if not saving locally
            return {
                status: 'success',
                message: 'Image selected successfully',
                imageUri: selectedImage.uri,
            };
        }

        // --- 3. Save image locally (if saveLocally is true) ---
        const savedImagePath = await saveImageLocally(selectedImage.uri);
        
        if (!savedImagePath) {
            return {
                status: 'error',
                message: 'Failed to save image locally',
            };
        }

        return {
            status: 'success',
            message: 'Image uploaded and saved successfully',
            imagePath: savedImagePath,
            imageUri: selectedImage.uri,
        };

    } catch (error) {
        console.error('Error in handleProfilePhotoUpload:', error);
        return {
            status: 'error',
            message: 'An unexpected error occurred during image upload',
        };
    }
}

/**
 * Alternative method that opens the camera instead of image library
 */
export async function handleProfilePhotoCameraCapture(): Promise<ImageUploadResult> {
    try {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permissionResult.status !== 'granted') {
            return {
                status: 'error',
                message: 'Permission to access camera is required!',
            };
        }

        // Launch camera
        const cameraResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (cameraResult.canceled) {
            return {
                status: 'cancelled',
                message: 'Camera capture was cancelled',
            };
        }

        const capturedImage = cameraResult.assets[0];
        const savedImagePath = await saveImageLocally(capturedImage.uri);

        if (!savedImagePath) {
            return {
                status: 'error',
                message: 'Failed to save captured image',
            };
        }

        return {
            status: 'success',
            message: 'Photo captured and saved successfully',
            imagePath: savedImagePath,
            imageUri: capturedImage.uri,
        };

    } catch (error) {
        console.error('Error in handleProfilePhotoCameraCapture:', error);
        return {
            status: 'error',
            message: 'An unexpected error occurred during camera capture',
        };
    }
}

/**
 * Saves an image from a URI to the app's document directory
 * @param imageUri The temporary URI of the selected/captured image
 * @returns The permanent local file path, or null if save failed
 */
async function saveImageLocally(imageUri: string): Promise<string | null> {
    try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `profile_photo_${timestamp}.jpg`;
        
        // Define the permanent file path
        const permanentPath = `${FileSystem.documentDirectory}${fileName}`;
        
        // Copy the image from temporary location to permanent location
        await FileSystem.copyAsync({
            from: imageUri,
            to: permanentPath,
        });

        return permanentPath;
    } catch (error) {
        console.error('Error saving image locally:', error);
        return null;
    }
}

/**
 * Provides options for image selection (Library vs Camera)
 * This can be used with an ActionSheet or Alert
 */
export function getImagePickerOptions() {
    return [
        {
            title: 'Choose from Library',
            handler: () => handleProfilePhotoUpload(),
        },
        {
            title: 'Take Photo',
            handler: () => handleProfilePhotoCameraCapture(),
        },
        {
            title: 'Cancel',
            style: 'cancel' as const,
        },
    ];
}
