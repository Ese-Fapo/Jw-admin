import { getFirebaseAdminStorage } from "@/lib/firebase-admin";

export type FirebaseStorageUploadResult = {
  secure_url: string;
  public_id: string;
};

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getDownloadUrl(bucketName: string, objectPath: string, token: string) {
  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;
}

export async function uploadToFirebaseStorage(file: File): Promise<FirebaseStorageUploadResult> {
  try {
    const storage = await getFirebaseAdminStorage();
    const bucket = storage.bucket();

    const timestamp = Date.now();
    const objectPath = `tech-blog/${timestamp}-${sanitizeFilename(file.name || "upload.bin")}`;
    const token = crypto.randomUUID();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadedFile = bucket.file(objectPath);
    await uploadedFile.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
      resumable: false,
    });

    return {
      secure_url: getDownloadUrl(bucket.name, objectPath, token),
      public_id: objectPath,
    };
  } catch (error) {
    console.error("Erro no upload para Firebase Storage:", error);
    throw new Error(
      `Falha no upload para Firebase Storage: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}

export async function deleteFromFirebaseStorage(objectPath: string): Promise<void> {
  try {
    const storage = await getFirebaseAdminStorage();
    const bucket = storage.bucket();
    await bucket.file(objectPath).delete({ ignoreNotFound: true });
  } catch (error) {
    console.error("Erro ao deletar do Firebase Storage:", error);
    throw new Error(
      `Falha ao deletar do Firebase Storage: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}
