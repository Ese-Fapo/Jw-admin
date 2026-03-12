import cloudinary from "@/lib/cloudinary";

/**
 * Type definition for Cloudinary upload response
 */
export type CloudinaryUploadResult = {
    secure_url: string;
    public_id: string;
};

/**
 * Uploads a file to Cloudinary and returns the secure URL and public ID
 * @param file - The file to upload
 * @returns Promise with the uploaded file's secure URL and public ID
 * @throws Error if the upload fails
 */
export async function uploadToCloudinary(
    file: File
): Promise<CloudinaryUploadResult> {
    try {
        // Convert file to base64 data URI for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary with optimizations
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'tech-blog',
            transformation: [
                { quality: 'auto' }, 
                { fetch_format: 'webp' }
            ],
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Erro no upload para Cloudinary:', error);
        throw new Error(
            `Falha no upload para Cloudinary: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
    }
}

/**
 * Deletes an image from Cloudinary using its public ID
 * @param publicId - The public ID of the image to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error if the deletion fails
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Erro ao deletar do Cloudinary:', error);
        throw new Error(
            `Falha ao deletar do Cloudinary: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
    }
}