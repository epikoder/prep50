// @deno-types: @aws-sdk/client-s3/S3Client.d.ts
import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = () =>
  new S3Client({
    endpoint: "https://sfo3.digitaloceanspaces.com",
    forcePathStyle: false,
    region: "nyc3",
    credentials: {
      accessKeyId: Deno.env.get("SPACES_ACCESS") || "",
      secretAccessKey: Deno.env.get("SPACES_SECRET") || "",
    },
  });

const generateUploadFileParam = (
  { name, body }: { name: string; body: ArrayBuffer },
): PutObjectCommandInput => ({
  Bucket: `${Deno.env.get("BUCKET_NAME") || "prep50"}`,
  ACL: "public-read",
  Key: name,
  Body: body,
});

// Step 4: Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
export default async function uploadObject(
  param: { name: string; body: ArrayBuffer },
) {
  const dir = Deno.env.get("SPACES_DIRECTORY");
  const cfg = generateUploadFileParam({
    ...param,
    name: dir
      ? param.name.startsWith(dir) ? param.name : dir + param.name
      : param.name,
  });
  const cmd = new PutObjectCommand({
    ...cfg,
  }) as unknown as Parameters<S3Client["send"]>["0"];

  try {
    const data = <PutObjectCommandOutput> (await s3Client().send(cmd));
    return data;
  } catch (err) {
    console.log(generateUploadFileParam);
    console.log("Error", err);
  }
}
