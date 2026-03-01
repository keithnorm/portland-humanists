import React from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';
import type { JoinQuery, JoinQueryVariables } from '../../tina/__generated__/types';

interface Props {
  query: string;
  variables: JoinQueryVariables;
  data: JoinQuery;
}

// Radio values are stable identifiers used by the form script — not CMS-managed
const TIER_VALUES = ['individual', 'joint', 'limited', 'newsletter'];

export function JoinVisualEditor({ query, variables, data }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const page = tinaData.join;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            data-tina-field={tinaField(page, 'heroHeading')}
          >
            {page.heroHeading}
          </h1>
          <p
            className="text-xl text-[#c8d9ec]"
            data-tina-field={tinaField(page, 'heroTagline')}
          >
            {page.heroTagline}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Benefits Sidebar */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-8 shadow-sm sticky top-24">
                <h2
                  className="text-2xl font-bold text-neutral-900 mb-6"
                  data-tina-field={tinaField(page, 'benefitsHeading')}
                >
                  {page.benefitsHeading}
                </h2>
                <div className="space-y-4">
                  {page.benefits?.map((benefit, i) => benefit && (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-neutral-900"
                          data-tina-field={tinaField(benefit, 'title')}
                        >
                          {benefit.title}
                        </h3>
                        <p
                          className="text-sm text-neutral-600"
                          data-tina-field={tinaField(benefit, 'description')}
                        >
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Membership Form */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Membership Information</h2>

                <form id="membershipForm" className="space-y-6">
                  {/* Philosophical Agreement */}
                  <div className="bg-[#f4f7fb] p-6 rounded-lg">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" name="agreePhilosophy" required className="mt-1" />
                      <div>
                        <div className="font-medium text-neutral-900">
                          Philosophical Agreement <span className="text-red-500">*</span>
                        </div>
                        <div
                          className="text-sm text-neutral-700 mt-1"
                          data-tina-field={tinaField(page, 'philosophyText')}
                        >
                          {page.philosophyText}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Personal Information — CMS-managed fields */}
                  <div>
                    <h3
                      className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b"
                      data-tina-field={tinaField(page, 'personalInfoHeading')}
                    >
                      {page.personalInfoHeading}
                    </h3>
                    <div className="space-y-4">
                      {page.personalFields?.map((field, i) => field && (
                        <div key={i}>
                          <label
                            htmlFor={field.fieldName ?? `field-${i}`}
                            className="block text-sm font-medium text-neutral-700 mb-2"
                            data-tina-field={tinaField(field, 'label')}
                          >
                            {field.label}
                            {field.required && <span className="text-red-500"> *</span>}
                          </label>
                          {field.fieldType === 'textarea' ? (
                            <textarea
                              id={field.fieldName ?? `field-${i}`}
                              name={field.fieldName ?? `field-${i}`}
                              required={field.required ?? false}
                              placeholder={field.placeholder ?? ''}
                              rows={3}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <input
                              type={(field.fieldType as React.HTMLInputTypeAttribute) ?? 'text'}
                              id={field.fieldName ?? `field-${i}`}
                              name={field.fieldName ?? `field-${i}`}
                              required={field.required ?? false}
                              placeholder={field.placeholder ?? ''}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Membership Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Membership Level</h3>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p
                        className="text-sm text-amber-900"
                        data-tina-field={tinaField(page, 'membershipNote')}
                      >
                        <strong>Note:</strong> {page.membershipNote}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {page.membershipTiers?.map((tier, i) => tier && (
                        <label
                          key={i}
                          className="flex items-start gap-3 p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <input
                            type="radio"
                            name="membershipType"
                            value={TIER_VALUES[i] ?? `tier${i}`}
                            defaultChecked={i === 0}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div
                                  className="font-semibold text-neutral-900"
                                  data-tina-field={tinaField(tier, 'tierName')}
                                >
                                  {tier.tierName}
                                </div>
                                <div
                                  className="text-sm text-neutral-600"
                                  data-tina-field={tinaField(tier, 'tierSubtitle')}
                                >
                                  {tier.tierSubtitle}
                                </div>
                              </div>
                              <div
                                className="text-base font-semibold text-[#1e3a5f]"
                                data-tina-field={tinaField(tier, 'priceRange')}
                              >
                                {tier.priceRange}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Membership Amount */}
                  <div>
                    <label htmlFor="membershipAmount" className="block text-sm font-medium text-neutral-700 mb-2">
                      Membership Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        type="number"
                        id="membershipAmount"
                        name="membershipAmount"
                        min="0"
                        step="1"
                        placeholder="50.00"
                        required
                        className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      Enter an amount within the suggested range for your membership type
                    </p>
                  </div>

                  {/* Lifetime Membership */}
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" name="lifetimeMember" className="mt-1" />
                      <div>
                        <div className="font-medium text-neutral-900">Lifetime Membership</div>
                        <div className="text-sm text-neutral-600 mt-1">
                          Check this box if you have been a continuous member for 5+ years and wish to be designated as a Lifetime Member
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Communication Preferences — CMS-managed checkboxes */}
                  <div>
                    <h3
                      className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b"
                      data-tina-field={tinaField(page, 'communicationPrefsHeading')}
                    >
                      {page.communicationPrefsHeading}
                    </h3>
                    <div className="space-y-3">
                      {page.communicationFields?.map((commField, i) => commField && (
                        <label key={i} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            name={commField.fieldName ?? `comm-${i}`}
                            defaultChecked={commField.defaultChecked ?? false}
                            className="mt-1"
                          />
                          <div>
                            <div
                              className="font-medium text-neutral-900"
                              data-tina-field={tinaField(commField, 'label')}
                            >
                              {commField.label}
                            </div>
                            {commField.description && (
                              <div
                                className="text-sm text-neutral-600"
                                data-tina-field={tinaField(commField, 'description')}
                              >
                                {commField.description}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="pt-6">
                    <div id="totalAmount" className="bg-[#f4f7fb] rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-700 font-medium">Total Amount:</span>
                        <span className="text-2xl font-bold text-[#1e3a5f]">$0.00</span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <p className="text-sm text-neutral-500 text-center mt-4">
                      Secure payment processing powered by PayPal
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl font-bold text-neutral-900 mb-4"
            data-tina-field={tinaField(page, 'questionsHeading')}
          >
            {page.questionsHeading}
          </h2>
          <p className="text-lg text-neutral-600 mb-6">
            <span data-tina-field={tinaField(page, 'questionsBody')}>{page.questionsBody}</span>
            {' '}
            <a
              href={`mailto:${page.membershipEmail}`}
              className="text-[#1e3a5f] hover:text-[#1e3a5f] font-medium"
              data-tina-field={tinaField(page, 'membershipEmail')}
            >
              {page.membershipEmail}
            </a>
          </p>
          <p
            className="text-neutral-600"
            data-tina-field={tinaField(page, 'questionsFootnote')}
          >
            {page.questionsFootnote}
          </p>
        </div>
      </section>
    </>
  );
}
