import { env } from "../configs/env";
import { ClubModel } from "../models/Club.model";
import { getGridFsBucket } from "../utils/gridfs";
import { ObjectId } from "mongodb";

const PUBLIC_API_ORIGIN =
  (env.PUBLIC_API_BASE || "http://localhost:8081").replace(/\/+$/, "");

export const ClubImageService = {
  async updateCoverImage(opts: {
    requesterUserId: string;
    clubId: string;
    fileBuffer: Buffer;
    mimeType: string;
    originalName?: string;
  }) {
    const { requesterUserId, clubId, fileBuffer, mimeType, originalName } = opts;

    const club = await ClubModel.findById(clubId);
    if (!club) {
      throw new Error("Club not found");
    }
    if (!mimeType.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }
    if (fileBuffer.length > 2 * 1024 * 1024) {
      throw new Error("Image too large");
    }

    const bucket = getGridFsBucket();
    const filename = originalName || `club-${clubId}-${Date.now()}`;

    await new Promise<void>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimeType,
        metadata: { clubId, uploadedBy: requesterUserId },
      });

      uploadStream.once("error", reject);
      uploadStream.once("finish", async () => {
        const fileId = uploadStream.id as ObjectId;

        club.cover_image_file_id = String(fileId);
        club.cover_image_mime = mimeType;
        club.cover_image_url = `${PUBLIC_API_ORIGIN}/api/clubs/${clubId}/cover-image`;

        try {
          await club.save();
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      uploadStream.end(fileBuffer);
    });

    return { cover_image_url: club.cover_image_url };
  },

  async getCoverImageStream(clubId: string) {
    const club = await ClubModel.findById(
      clubId,
      "cover_image_file_id cover_image_mime"
    ).lean();

    if (!club || !club.cover_image_file_id) {
      return null;
    }

    const bucket = getGridFsBucket();
    const fileId = new ObjectId(club.cover_image_file_id);

    return {
      mime: club.cover_image_mime || "application/octet-stream",
      stream: bucket.openDownloadStream(fileId),
    };
  },
};
