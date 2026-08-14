import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/shared/page-hero';
import CTASection from '@/components/shared/cta-section';
import { useCMS } from '@/lib/cms-context';
import { getTelLink, getMapsLink, getWhatsAppLink } from '@/lib/communication';
import { submitEnquiryToGoogleSheets } from '@/lib/google-script-config';
import { submitGeneralEnquiryToNeon } from '@/lib/submissions';
import { fadeInUp, staggerContainer } from '@/lib/motion';

interface ContactFormData {
  name: string;
  mobile: string;
  email: string;
  course: string;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  mobile?: string;
  email?: string;
  message?: string;
}

const initialFormData: ContactFormData = {
  name: '',
  mobile: '',
  email: '',
  course: '',
  message: '',
};

function buildWhatsAppMessage(form: ContactFormData): string {
  const lines = [
    '*New Enquiry — Prarthana PU Science College*',
    '',
    `*Name:* ${form.name}`,
    `*Mobile:* ${form.mobile}`,
    form.email ? `*Email:* ${form.email}` : null,
    form.course ? `*Course Interested:* ${form.course}` : null,
    form.message ? `*Message:* ${form.message}` : null,
  ].filter(Boolean) as string[];
  return lines.join('\n');
}

export default function ContactPage() {
  const cms = useCMS();
  const siteConfig = cms.siteConfig;
  const contactCards = useMemo(() => [
    {
      icon: Phone,
      title: 'Phone',
      details: [siteConfig.phoneDisplay, siteConfig.phone2Display].filter(Boolean) as string[],
      link: getTelLink(),
      linkLabel: 'Call us',
    },
    {
      icon: Mail,
      title: 'Email',
      details: [siteConfig.email],
      link: `mailto:${siteConfig.email}`,
      linkLabel: 'Send email',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: [
        siteConfig.address.line1,
        siteConfig.address.line2,
        siteConfig.address.line3,
        `${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.pincode}`,
      ].filter(Boolean) as string[],
      link: getMapsLink(),
      linkLabel: 'Get directions',
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: siteConfig.officeHours
        ? siteConfig.officeHours.split('\n').map((s) => s.trim()).filter(Boolean)
        : ['Monday – Saturday', '9:00 AM – 5:00 PM', 'Sunday: Closed'],
    },
  ], [siteConfig]);

  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastSubmittedData, setLastSubmittedData] = useState<ContactFormData | null>(null);

  const validate = (): ContactFormErrors => {
    const errs: ContactFormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) errs.mobile = 'Please enter a valid 10-digit mobile number';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof ContactFormErrors];
        return next;
      });
    }
  };

  const attemptSubmission = async (data: ContactFormData): Promise<{ success: boolean; error?: string }> => {
    const neonResult = await submitGeneralEnquiryToNeon({
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      course: data.course,
      message: data.message,
      enquiryType: 'Contact Form',
    });

    if (!neonResult.success) {
      console.error('Neon enquiry insert failed:', neonResult.error);
      return { success: false, error: neonResult.error || 'Failed to save enquiry' };
    }

    setRetryCount(0);
    void submitEnquiryToGoogleSheets({
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        course: data.course,
        message: data.message,
        enquiryType: 'Contact Form',
      }).then((result) => {
        if (!result.success) console.warn('Background contact enquiry Google Sheets sync failed:', result.error);
      }).catch((sheetError) => {
        console.warn('Background contact enquiry Google Sheets sync exception:', sheetError);
      });

    return { success: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const frozen = { ...formData };
    setLastSubmittedData(frozen);

    try {
      const result = await attemptSubmission(frozen);

      if (result.success) {
        setSubmitted(true);
        setFormData(initialFormData);
        setRetryCount(0);
      } else {
        setSubmitError(
          'We were unable to save your enquiry to our records at this time. Please try again in a moment. Your information is preserved below.'
        );
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (lastSubmittedData) {
      setFormData(lastSubmittedData);
      setSubmitted(false);
      setSubmitError('');
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all';
  const labelClass = 'block text-sm font-semibold text-secondary-700 mb-1.5';

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        subtitle="We're here to help. Reach out to us with any questions about admissions, courses, hostel, transport or anything else."
      />

      {/* Contact Info Cards */}
      <section className="py-16 md:py-24" aria-labelledby="contact-info-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="contact-info-title" className="sr-only">Contact Information</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-5">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{card.title}</h3>
                  <div className="space-y-1">
                    {card.details.map((detail, i) => (
                      <p key={i} className="text-sm text-secondary-600">{detail}</p>
                    ))}
                  </div>
                  {card.link && (
                    <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary-800 hover:text-primary-900 transition-colors">
                      {card.linkLabel} →
                    </span>
                  )}
                </>
              );
              return (
                <motion.div key={card.title} variants={fadeInUp}>
                  {card.link ? (
                    <a
                      href={card.link}
                      target={card.link.startsWith('http') ? '_blank' : undefined}
                      rel={card.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block bg-white rounded-2xl p-6 shadow-soft hover:shadow-premium transition-shadow duration-300 border border-primary-100/60 h-full"
                      aria-label={`${card.title}: ${card.linkLabel}`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100/60 h-full">{content}</div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 md:py-24 bg-primary-50/60" aria-labelledby="contact-form-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <h2 id="contact-form-title" className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                Send Us an Enquiry
              </h2>
              <p className="text-secondary-600 mb-2">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              <p className="text-xs text-secondary-500 mb-6 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-success-500" />
                Your enquiry will be saved securely to our Enquiries records. WhatsApp is available below as an optional contact method.
              </p>

              {submitted ? (
                <div className="bg-white rounded-3xl p-8 shadow-soft text-center border border-success-100">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-success-500/20"
                  >
                    <CheckCircle2 className="text-white" size={42} strokeWidth={2.5} />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-black text-secondary-900 mb-4">Enquiry Submitted Successfully!</h3>
                  <div className="bg-primary-50/60 rounded-2xl p-5 md:p-6 border border-primary-100 mb-6 max-w-lg mx-auto">
                    <p className="text-base md:text-lg font-semibold text-primary-800 leading-relaxed">
                      Thank you! Your enquiry has been submitted successfully. Our admission team will contact you shortly.
                    </p>
                  </div>
                  <p className="text-secondary-500 text-sm mb-6 max-w-md mx-auto">
                    Reference: ENQ-{new Date().getFullYear()}-{Math.floor(10000 + Math.random() * 90000)}
                    <br />
                    Expected response: within 24 working hours
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    <Link
                      to="/admission"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Apply for Admission →
                    </Link>
                    <a
                      href={getWhatsAppLink(lastSubmittedData ? buildWhatsAppMessage(lastSubmittedData) : '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:brightness-110 transition-all shadow-sm"
                    >
                      <MessageCircle size={18} /> Follow up on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-primary-900 bg-primary-100 hover:bg-primary-200 transition-colors"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-soft space-y-5 border border-primary-100/70"
                >
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-50/60 border border-primary-100 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <Send size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary-900">Send us your enquiry</p>
                      <p className="text-xs text-secondary-500">Your enquiry will be saved securely to our records and our team will contact you.</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-name" className={labelClass}>Student / Parent Name <span className="text-error-500">*</span></label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-error-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-mobile" className={labelClass}>Mobile Number <span className="text-error-500">*</span></label>
                      <input
                        id="contact-mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        className={inputClass}
                        maxLength={10}
                        aria-required="true"
                        aria-invalid={!!errors.mobile}
                        placeholder="10-digit mobile"
                      />
                      {errors.mobile && <p className="text-error-500 text-xs mt-1">{errors.mobile}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelClass}>Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={inputClass}
                        aria-invalid={!!errors.email}
                        placeholder="Optional"
                      />
                      {errors.email && <p className="text-error-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-course" className={labelClass}>Course Interested</label>
                    <select
                      id="contact-course"
                      value={formData.course}
                      onChange={(e) => handleChange('course', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Course (Optional)</option>
                      <option value="PCMB">PCMB — Physics, Chemistry, Maths & Biology (Medical & Engineering)</option>
                      <option value="PCMC">PCMC — Physics, Chemistry, Maths & Computer Science (Engineering & Tech)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className={labelClass}>Message <span className="text-error-500">*</span></label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      placeholder="Tell us about your question or requirement"
                    />
                    {errors.message && <p className="text-error-500 text-xs mt-1">{errors.message}</p>}
                  </div>

                  {submitError && (
                    <div className="p-4 rounded-xl bg-error-50 border border-error-200" role="alert">
                      <p className="text-error-700 text-sm font-semibold">{submitError}</p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-3 text-xs font-bold text-error-800 underline underline-offset-2 hover:text-error-900"
                      >
                        Click here to retry with the same information
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-primary hover:shadow-lg hover:shadow-primary-700/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    aria-label="Submit contact enquiry form"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {retryCount > 1 ? `Saving Enquiry (Attempt ${retryCount}/3)...` : 'Saving Enquiry to Records...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit Enquiry to Records
                      </>
                    )}
                  </button>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <a
                      href={getWhatsAppLink('Hello, I have a query regarding admissions at Prarthana PU Science College.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-colors"
                    >
                      <MessageCircle size={14} /> Or use WhatsApp
                    </a>
                    <a
                      href={getTelLink()}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors"
                    >
                      <Phone size={14} /> Call College
                    </a>
                  </div>

                  <p className="text-[11px] text-secondary-400 text-center leading-relaxed pt-1">
                    By submitting this form you consent to our processing of this enquiry. Your data is saved securely to our Enquiries Google Sheet for follow-up.
                  </p>
                </form>
              )}
            </motion.div>

            {/* Map */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                Find Us on the Map
              </h2>
              <p className="text-secondary-600 mb-6">
                Visit our campus at {siteConfig.address.full}.
              </p>
              <div className="rounded-3xl overflow-hidden shadow-soft h-[400px] md:h-[500px] border border-primary-100/70">
                <iframe
                  src={siteConfig.mapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${siteConfig.name} location`}
                  aria-label={`Map of ${siteConfig.name}`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
