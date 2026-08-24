"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ARTICLES, Article } from "@/data/articles";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

const CATEGORIES = [
  "All Articles",
  "Buyer Guides",
  "Finance & Mortgage",
  "Market Insights",
  "Home Selling"
];

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === "All Articles" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = ARTICLES[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Hero Header */}
      <section className="bg-surface border-b border-line py-12 md:py-16">
        <div className="estateline-container">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <EyebrowLabel>RealInsight & Research</EyebrowLabel>
              <div className="border border-brass text-brass font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Estateline Knowledge Base
              </div>
            </div>
            <h1 className="font-fraunces text-3xl md:text-5xl font-semibold text-ink leading-tight">
              Informative Articles & Market Insights<span className="text-brass">.</span>
            </h1>
            <p className="text-sm md:text-base text-ink-soft leading-relaxed">
              Explore in-depth analysis, architectural guides, mortgage intelligence, and expert advice to make confident real estate decisions.
            </p>

            {/* Search Input */}
            <div className="pt-2 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles by topic, keyword, or guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl pl-10 pr-4 py-3 text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition-all"
                />
                <span className="absolute left-3.5 top-3.5 text-ink-soft text-sm">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-xs text-ink-soft hover:text-ink"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="estateline-container py-10 space-y-12">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brass text-white shadow-xs"
                  : "bg-surface text-ink border border-line hover:border-ink/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Banner (shown when All is selected and no search) */}
        {selectedCategory === "All Articles" && !searchQuery && featuredArticle && (
          <div className="bg-surface border border-line rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 h-64 lg:h-auto min-h-[300px] relative overflow-hidden bg-bg">
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-brass text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Featured Guide
                </div>
              </div>
              <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="font-medium text-brass">{featuredArticle.category}</span>
                    <span>•</span>
                    <span>{featuredArticle.readTime}</span>
                    <span>•</span>
                    <span>{featuredArticle.date}</span>
                  </div>
                  <h2 className="font-fraunces text-2xl font-bold text-ink group-hover:text-brass transition-colors leading-snug">
                    <Link href={`/articles/${featuredArticle.id}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-4">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-line"
                    />
                    <div>
                      <div className="text-xs font-semibold text-ink leading-none">
                        {featuredArticle.author.name}
                      </div>
                      <div className="text-[10px] text-ink-soft">
                        {featuredArticle.author.role}
                      </div>
                    </div>
                  </div>
                  <Link href={`/articles/${featuredArticle.id}`}>
                    <Button variant="brass" size="sm">
                      Read Article →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fraunces text-2xl font-semibold text-ink">
              {searchQuery ? `Search Results (${filteredArticles.length})` : `${selectedCategory}`}
            </h3>
            <span className="text-xs text-ink-soft">
              Showing {filteredArticles.length} articles
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-line rounded-2xl space-y-3">
              <span className="text-4xl">📚</span>
              <h4 className="font-fraunces text-lg font-semibold text-ink">No articles found</h4>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try clearing filters or searching for terms like &quot;mortgage&quot;, &quot;offer&quot;, or &quot;townhome&quot;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Articles");
                }}
              >
                Reset Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-surface border border-line rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <Link href={`/articles/${article.id}`} className="block">
                    <div className="h-48 relative overflow-hidden bg-bg">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-bg/90 backdrop-blur-xs text-ink text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-line shadow-2xs">
                        {article.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-ink-soft">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h4 className="font-fraunces font-bold text-base text-ink group-hover:text-brass transition-colors leading-snug">
                        <Link href={`/articles/${article.id}`}>
                          {article.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-line"
                        />
                        <span className="text-xs font-medium text-ink">
                          {article.author.name}
                        </span>
                      </div>
                      <Link
                        href={`/articles/${article.id}`}
                        className="text-xs font-medium text-brass hover:text-brass-deep transition-colors inline-flex items-center gap-0.5"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Real Insight Newsletter Section */}
        <div className="bg-surface rounded-2xl p-8 md:p-10 border border-line flex flex-col md:flex-row items-start md:items-center gap-8 shadow-sm mt-12">
          <div className="border border-brass text-brass font-bold text-sm tracking-tight px-4 py-3 rounded-xl leading-tight text-center bg-bg shadow-xs flex-shrink-0">
            <div className="text-base font-extrabold border-b border-line pb-0.5">REAL</div>
            <div className="text-xs font-semibold pt-0.5">INSIGHT</div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-fraunces font-semibold text-lg text-ink">
                Stay updated with real estate industry trends, news, and insights
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Subscribe to receive valuable articles, local market statistics, and architectural analysis in your inbox.
              </p>
            </div>

            {newsletterSubscribed ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between shadow-xs">
                <span>✓ Thank you for subscribing to RealInsight! You will receive our latest articles and updates.</span>
                <button
                  type="button"
                  onClick={() => setNewsletterSubscribed(false)}
                  className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full sm:flex-1 px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-brass hover:bg-brass-deep text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
