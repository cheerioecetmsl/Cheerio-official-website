import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:Cheerio/Archives/Images AND resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    const urls = resources.map((r: any) => ({
      url: r.secure_url,
      type: r.resource_type,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, data: urls });
  } catch (error: any) {
    console.error('Cloudinary fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
