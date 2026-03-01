import React from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text';
import type { PagesQuery, PagesQueryVariables } from '../../tina/__generated__/types';

interface Props {
  query: string;
  variables: PagesQueryVariables;
  data: PagesQuery;
}

export function PageVisualEditor({ query, variables, data }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const page = tinaData.pages;

  return (
    <>
      {/* Hero */}
      <section className={`text-white py-16 ${page.heroGradient || 'bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7f]'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            data-tina-field={tinaField(page, 'title')}
          >
            {page.title}
          </h1>
          <p
            className="text-xl text-[#c8d9ec]"
            data-tina-field={tinaField(page, 'description')}
          >
            {page.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none"
            data-tina-field={tinaField(page, 'body')}
          >
            {page.body && (
              <TinaMarkdown content={page.body as TinaMarkdownContent} />
            )}
          </div>

          {/* Contact Info (about layout only) */}
          {page.pageLayout === 'about' && page.contactInfo && (
            <div className="mt-12 bg-[#f4f7fb] rounded-xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h3>
              <div className="space-y-3">
                {page.contactInfo.email && (
                  <p className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a
                      href={`mailto:${page.contactInfo.email}`}
                      className="text-[#1e3a5f] hover:text-[#1e3a5f] font-medium"
                      data-tina-field={tinaField(page.contactInfo, 'email')}
                    >
                      {page.contactInfo.email}
                    </a>
                  </p>
                )}
                {page.contactInfo.location && (
                  <p className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#1e3a5f] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span
                      className="text-neutral-700"
                      data-tina-field={tinaField(page.contactInfo, 'address')}
                    >
                      {page.contactInfo.address?.split('\n').map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
