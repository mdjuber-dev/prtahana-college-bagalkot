import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useCMS } from '@/lib/cms-context';
import { submitPopupEnquiryToGoogleSheets } from '@/lib/google-script-config';
import { submitGeneralEnquiryToSupabase } from '@/lib/submissions';

const POPUP_SESSION_KEY = 'prarthana_popup_shown';

interface PopupFormData { studentName: string; mobileNumber: string; courseInterested: string; }
const initialFormData: PopupFormData = { studentName: '', mobileNumber: '', courseInterested: '' };

export default function AdmissionPopup() {
  const cms = useCMS();
  const popup = cms.popup;
  const config = cms.siteConfig;
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<PopupFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (popup?.enabled === false) return;
    if (sessionStorage.getItem(POPUP_SESSION_KEY)) return;
    const triggerPercent = popup?.scrollTriggerPercent ?? 35;
    const handleScroll = () => {
      if (sessionStorage.getItem(POPUP_SESSION_KEY)) return;
      const homeSection = document.getElementById('home-page-content');
      if (!homeSection) return;
      const rect = homeSection.getBoundingClientRect();
      const totalHeight = homeSection.offsetHeight;
      const scrolled = Math.abs(rect.top);
      const scrollPercent = (scrolled / totalHeight) * 100;
      if (scrollPercent >= triggerPercent && scrollPercent <= triggerPercent + 5) {
        sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popup?.enabled, popup?.scrollTriggerPercent]);

  if (popup?.enabled === false) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.studentName.trim()) e.studentName = 'Name is required';
    if (!formData.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) e.mobileNumber = 'Enter a valid 10-digit mobile number';
    if (!formData.courseInterested) e.courseInterested = 'Please select a course';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const studentName = formData.studentName.trim();
      const mobileNumber = formData.mobileNumber.trim();
      const courseInterested = formData.courseInterested;

      const supabasePayload = {
        name: studentName,
        mobile: mobileNumber,
        email: '',
        course: courseInterested,
        message: 'Popup enquiry',
        enquiryType: 'Popup',
        source: 'Website',
      };

      const sheetPayload = {
        studentName,
        mobileNumber,
        courseInterested,
      };

      const [supabaseResult, sheetResult] = await Promise.all([
        submitGeneralEnquiryToSupabase(supabasePayload),
        submitPopupEnquiryToGoogleSheets(sheetPayload),
      ]);

      const errors: string[] = [];
      if (!supabaseResult.success) {
        errors.push(supabaseResult.error || 'Unable to save enquiry to Supabase.');
      }
      if (!sheetResult.success) {
        errors.push(sheetResult.error || 'Unable to sync enquiry to Google Sheet.');
      }

      if (errors.length > 0) {
        throw new Error(errors.join(' '));
      }

      setSubmitted(true);

      setTimeout(() => {
        setVisible(false);
        setSubmitted(false);
        setFormData(initialFormData);
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error('Enquiry submission failed:', error);
      alert(error instanceof Error ? error.message : 'Unable to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setVisible(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-hero p-6 text-center relative">
              <button
                onClick={() => setVisible(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close popup"
              >
                <X size={22} />
              </button>
              <img src={popup?.logo || config.logo} alt={`${config.name} logo`} className="w-16 h-16 mx-auto object-contain mb-3" width={64} height={64} />
              <h2 id="popup-title" className="text-xl md:text-2xl font-bold text-white">{popup?.title || 'Admission Enquiry'}</h2>
              <p className="text-white/80 text-sm mt-1">{popup?.subtitle || 'Enquire now and secure your seat!'}</p>
            </div>
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto text-success-500 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">Thank You!</h3>
                  <p className="text-secondary-600 text-sm">Your enquiry has been submitted successfully. We will contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="popup-name" className="block text-sm font-medium text-secondary-700 mb-1">Student Name <span className="text-error-500">*</span></label>
                    <input id="popup-name" type="text" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-base" placeholder="Enter student name" aria-required="true" aria-invalid={!!errors.studentName} />
                    {errors.studentName && <p className="text-error-500 text-xs mt-1">{errors.studentName}</p>}
                  </div>
                  <div>
                    <label htmlFor="popup-mobile" className="block text-sm font-medium text-secondary-700 mb-1">Mobile Number <span className="text-error-500">*</span></label>
                    <input id="popup-mobile" type="tel" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-base" placeholder="10-digit mobile number" maxLength={10} aria-required="true" aria-invalid={!!errors.mobileNumber} />
                    {errors.mobileNumber && <p className="text-error-500 text-xs mt-1">{errors.mobileNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="popup-course" className="block text-sm font-medium text-secondary-700 mb-1">Course Interested <span className="text-error-500">*</span></label>
                    <select id="popup-course" value={formData.courseInterested} onChange={(e) => setFormData({ ...formData, courseInterested: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-base bg-white" aria-required="true" aria-invalid={!!errors.courseInterested}>
                      <option value="">Select a course</option>
                      {(popup?.courses?.length ? popup.courses : ['PCMB', 'PCMC']).map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                    {errors.courseInterested && <p className="text-error-500 text-xs mt-1">{errors.courseInterested}</p>}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : <><Send size={18} /> Submit Enquiry</>}
                    </button>
                    <button type="button" onClick={() => setVisible(false)} className="w-full px-6 py-2.5 text-secondary-600 font-medium rounded-lg hover:bg-secondary-100 transition-colors text-sm">Maybe Later</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
