import BlogView from "@/app/blog-page/BlogView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostViewPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <BlogView slug={slug} />;
}
