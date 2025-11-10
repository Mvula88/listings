import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single() as {
      data: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        cover_image: string | null;
        meta_title: string | null;
        meta_description: string | null;
        meta_keywords: string[] | null;
        published_at: string;
      } | null;
      error: any;
    }

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.meta_title || `${post.title} | DealDirect Blog`,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!author_id(full_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single() as {
      data: {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        cover_image: string | null;
        category_id: string | null;
        published_at: string;
        updated_at: string;
        views: number;
        reading_time_minutes: number | null;
        author: { full_name: string | null; avatar_url: string | null };
      } | null;
      error: any;
    }

  if (!post) {
    notFound()
  }

  // Get category
  const { data: category } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .eq('slug', (post as any).category)
    .single()

  // Get related posts
  const { data: relatedPosts } = await (supabase as any)
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at')
    .eq('status', 'published')
    .eq('category', (post as any).category)
    .neq('id', post.id)
    .limit(3)

  // Increment views
  await (supabase as any)
    .from('blog_posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.full_name || 'DealDirect Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DealDirect',
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative h-[400px] bg-muted">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article className="container max-w-4xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="mb-6">
          {category && (
            <Badge
              className="mb-4"
              style={{
                backgroundColor: category.color,
                color: 'white',
              }}
            >
              {category.name}
            </Badge>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author?.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.full_name || 'Author'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="font-medium">
                {post.author?.full_name || 'DealDirect Team'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
            </div>
            {post.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time_minutes} min read</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group"
                >
                  {related.cover_image && (
                    <div className="relative h-48 bg-muted rounded-lg overflow-hidden mb-3">
                      <Image
                        src={related.cover_image}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {related.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
