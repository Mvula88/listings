import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export const metadata: Metadata = {
  title: 'Blog | PropLinka - Real Estate Tips & Insights',
  description: 'Expert advice on buying, selling, and investing in real estate. Market insights, legal tips, and success stories.',
  keywords: 'real estate blog, property tips, buying guide, selling tips, market insights',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get categories
  const { data: categories } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .order('name')

  // Get blog posts
  let query = (supabase as any)
    .from('blog_posts')
    .select(`
      *,
      author:profiles!author_id(full_name, avatar_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (params.category) {
    query = query.eq('category', params.category)
  }

  const { data: posts } = await query

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              PropLinka Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Expert insights, tips, and stories from the world of commission-free real estate
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/blog"
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    !params.category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  All Posts
                </Link>
                {categories?.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      params.category === category.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Blog Posts */}
          <div className="lg:col-span-3">
            {posts && posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post: any) => {
                  const category = categories?.find((c: any) => c.slug === post.category)

                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <Link href={`/blog/${post.slug}`}>
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Image */}
                          {post.cover_image && (
                            <div className="relative h-48 md:h-full bg-muted">
                              <Image
                                src={post.cover_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className={post.cover_image ? 'md:col-span-2 p-6' : 'md:col-span-3 p-6'}>
                            <div className="flex items-center gap-2 mb-3">
                              {category && (
                                <Badge
                                  style={{
                                    backgroundColor: category.color,
                                    color: 'white',
                                  }}
                                >
                                  {category.name}
                                </Badge>
                              )}
                              {post.tags?.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">
                              {post.title}
                            </h2>

                            {post.excerpt && (
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{post.author?.full_name || 'PropLinka Team'}</span>
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
                        </div>
                      </Link>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  Check back soon for new content!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
