"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleById } from "@/data/articles";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const article = getArticleById(id);

  if (!article) {
    return notFound();
  }

  const relatedArticles = ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Top Breadcrumb & Return */}
      <div className="border-b border-line bg-surface py-4">
        <div className="estateline-container flex items-center justify-between text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-ink">Articles</Link>
            <span>/</span>
            <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-md">
              {article.title}
            </span>
          </div>

          <Link
            href="/articles"
            className="text-brass hover:text-brass-deep font-medium inline-flex items-center gap-1"
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>

      {/* Article Header & Main Image */}
      <header className="py-10 md:py-14 bg-surface border-b border-line">
        <div className="estateline-container max-w-4xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-brass/10 text-brass font-semibold text-xs px-3 py-1 rounded-full border border-brass/20">
                {article.category}
              </span>
              <span className="text-xs text-ink-soft">•</span>
              <span className="text-xs text-ink-soft">{article.readTime}</span>
              <span className="text-xs text-ink-soft">•</span>
              <span className="text-xs text-ink-soft">{article.date}</span>
            </div>

            <h1 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-semibold text-ink leading-tight">
              {article.title}
            </h1>

            <p className="text-sm md:text-base text-ink-soft leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>

            {/* Author bar */}
            <div className="flex items-center justify-between pt-6 border-t border-line">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-line"
                />
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {article.author.name}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {article.author.role}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-bg border border-line text-ink-soft px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="estateline-container max-w-4xl py-8">
        <div className="w-full h-72 sm:h-96 md:h-[450px] relative rounded-2xl overflow-hidden shadow-lg border border-line">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Body */}
      <main className="estateline-container max-w-3xl pb-16">
        <div className="space-y-8 text-ink leading-relaxed font-inter">
          {/* Intro Paragraph */}
          <div className="text-base sm:text-lg text-ink font-serif italic border-l-2 border-brass pl-4 py-1 leading-relaxed bg-surface/50 rounded-r-lg">
            &ldquo;{article.content.intro}&rdquo;
          </div>

          {/* Body Sections */}
          {article.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-3.5 pt-4">
              <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-ink">
                {section.heading}
              </h2>
              <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                {section.body}
              </p>

              {section.keyTakeaway && (
                <div className="p-4 bg-surface border border-line rounded-xl my-4 flex items-start gap-3 shadow-2xs">
                  <span className="text-brass text-lg flex-shrink-0">💡</span>
                  <div className="text-xs sm:text-sm">
                    <strong className="text-ink font-semibold">Key Takeaway: </strong>
                    <span className="text-ink-soft">{section.keyTakeaway}</span>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <div className="pt-6 border-t border-line space-y-3">
            <h3 className="font-fraunces text-xl font-bold text-ink">
              The Bottom Line
            </h3>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              {article.content.conclusion}
            </p>
          </div>

          {/* Author Bio Box */}
          <div className="p-6 bg-surface border border-line rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-12">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-16 h-16 rounded-full object-cover border border-line flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-brass uppercase tracking-wider">
                Written by
              </div>
              <h4 className="font-fraunces text-base font-bold text-ink">
                {article.author.name}
              </h4>
              <p className="text-xs text-ink-soft leading-relaxed">
                {article.author.role} at Estateline RealInsight. Providing actionable market data and architectural analysis for modern buyers, sellers, and investors.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-line space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-fraunces text-2xl font-bold text-ink">
                More Articles & Insights
              </h3>
              <Link
                href="/articles"
                className="text-xs font-medium text-brass hover:text-brass-deep transition-colors"
              >
                View all articles →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-surface border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <Link href={`/articles/${rel.id}`}>
                    <div className="h-36 relative overflow-hidden bg-bg">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-[10px] text-brass font-medium">
                        {rel.category} • {rel.readTime}
                      </div>
                      <h4 className="font-fraunces font-bold text-xs text-ink group-hover:text-brass transition-colors leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
