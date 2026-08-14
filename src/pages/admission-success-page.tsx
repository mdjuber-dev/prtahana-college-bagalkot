import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, Printer, Phone, Mail, MapPin, Calendar, GraduationCap, User,
  Download, Home, MessageCircle, FileText, Hash, CheckCircle, Clock, QrCode,
} from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { getTelLink, getWhatsAppLink } from '@/lib/communication';
import { buildQRContent, type AdmissionFormData } from '@/lib/admission-config';
import { generatePremiumPDF, type PDFData } from '@/lib/pdf-generator';
import { sendAdmissionEmailNotification } from '@/lib/admission-notification';
import { getMediaUrl } from '@/lib/media-url';

interface AdmissionSuccessState {
  applicationId?: string;
  referenceCode?: string;
  submittedAt?: string;
  status?: string;
  formData?: AdmissionFormData;
}

export default function AdmissionSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const state = location.state as AdmissionSuccessState | null;
  const applicationId = state?.applicationId;
  const referenceCode = state?.referenceCode;
  const submittedAt = state?.submittedAt;
  const status = state?.status || 'New';
  const formData = state?.formData;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!applicationId) {
      navigate('/admission', { replace: true });
      return;
    }

    const qrContent = formData
      ? buildQRContent(applicationId, referenceCode || '', formData, submittedAt || new Date().toISOString())
      : applicationId;

    QRCode.toDataURL(qrContent, { width: 200, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        setQrDataUrl(url);
        setPdfReady(true);

        // Auto-generate + upload PDF + send college notification (fire-and-forget)
        const pdfData: PDFData = {
          applicationId,
          referenceCode: referenceCode || '',
          submittedAt: submittedAt || new Date().toISOString(),
          status,
          formData: formData || ({} as AdmissionFormData),
          qrDataUrl: url,
        };
        void (async () => {
          await sendAdmissionEmailNotification(
            pdfData,
            {
              studentName: formData?.studentName || '',
              applicationId,
              referenceCode: referenceCode || '',
              courseInterested: formData?.courseInterested || '',
              mobileNumber: formData?.mobileNumber || '',
              submittedAt: submittedAt || new Date().toISOString(),
              status,
              email: formData?.email || '',
            },
          );
        })();

      })
      .catch(() => setPdfReady(true));

    // Celebration confetti burst
    const fireConfetti = () => {
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();

      // Central burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
        colors,
        startVelocity: 45,
      });
    };

    const confettiTimer = setTimeout(fireConfetti, 400);

    // Optional success sound (short, pleasant chime via Web Audio API)
    const playSuccessSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          const start = now + index * 0.12;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
          osc.start(start);
          osc.stop(start + 0.4);
        });
      } catch {
        // Sound is optional — silently ignore any failure
      }
    };

    const soundTimer = setTimeout(playSuccessSound, 200);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(soundTimer);
    };
  }, [applicationId, referenceCode, submittedAt, formData, navigate]);

  if (!applicationId) {
    return null;
  }

  const formatDate = (iso: string) => {
    if (!iso) return new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    try {
      return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await generatePremiumPDF({
      applicationId,
      referenceCode: referenceCode || '',
      submittedAt: submittedAt || new Date().toISOString(),
      status,
      formData: formData || ({} as AdmissionFormData),
      qrDataUrl,
    });
  };

  const nextSteps = [
    'Our admission team will review your application and contact you within 24-48 hours.',
    'Keep your Application ID and Reference Code handy for all future communications with the college.',
    'Prepare the following documents for verification: SSLC marks card, transfer certificate, Aadhaar card, passport-size photos, and caste/income certificate (if applicable).',
    'Visit the college campus for document verification and fee payment as instructed by the admission office.',
  ];

  const summaryItems = [
    { icon: Hash, label: 'Application ID', value: applicationId },
    { icon: FileText, label: 'Reference Code', value: referenceCode || 'N/A' },
    { icon: Calendar, label: 'Submission Date', value: formatDate(submittedAt || '') },
    { icon: CheckCircle, label: 'Current Status', value: status },
  ];

  return (
    <>
      <section className="min-h-screen pt-28 pb-16 md:pt-36 md:pb-24 bg-secondary-50" aria-labelledby="success-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <CheckCircle2 className="text-white" size={56} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 id="success-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
              Congratulations!
            </h1>
            <p className="text-lg text-secondary-600 font-semibold">
              Application Submitted Successfully
            </p>
          </motion.div>

          {/* Acknowledgement Card */}
          <motion.div
            ref={printRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-hero p-6 md:p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src={getMediaUrl(siteConfig.logo)}
                  alt={`${siteConfig.name} logo`}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-white font-bold text-lg">{siteConfig.shortName}</span>
              </div>
              <p className="text-white/70 text-sm">Admission Application Acknowledgement</p>
            </div>

            {/* Summary */}
            <div className="p-6 md:p-8 border-b border-secondary-100">
              <div className="grid sm:grid-cols-2 gap-4">
                {summaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <Icon className="text-primary-600" size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-secondary-500">{item.label}</p>
                        <p className="text-sm font-semibold text-secondary-900 truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div className="p-6 md:p-8 border-b border-secondary-100 flex flex-col items-center">
                <div className="flex items-center gap-2 text-sm text-secondary-500 mb-3">
                  <QrCode size={16} />
                  <span>Scan to verify your application</span>
                </div>
                <img src={qrDataUrl} alt={`QR code for application ${applicationId}`} className="w-40 h-40" />
              </div>
            )}

            {/* Applicant Details */}
            {formData && (
              <div className="p-6 md:p-8 border-b border-secondary-100">
                <h2 className="text-lg font-bold text-secondary-900 mb-4">Applicant Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <User className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Student Name</p>
                      <p className="text-sm font-semibold text-secondary-900">{formData?.studentName || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Course Applied</p>
                      <p className="text-sm font-semibold text-secondary-900">{formData?.courseInterested || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Phone className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Mobile Number</p>
                      <p className="text-sm font-semibold text-secondary-900">{formData?.mobileNumber || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Mail className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Email</p>
                      <p className="text-sm font-semibold text-secondary-900 break-all">{formData?.email || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps Timeline */}
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-secondary-900 mb-4">Next Steps</h2>
              <ol className="space-y-4">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-primary text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm text-secondary-600 leading-relaxed block">{step}</span>
                      {index < nextSteps.length - 1 && (
                        <div className="w-px h-6 bg-secondary-200 ml-[-1.625rem] mt-2" aria-hidden="true" />
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {/* Estimated Response Time */}
              <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-success-50 border border-success-200">
                <Clock className="text-success-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-success-800">Estimated Response Time</p>
                  <p className="text-xs text-success-700">Our team will contact you within 24-48 hours.</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-6 md:p-8 bg-secondary-50 border-t border-secondary-100">
              <h2 className="text-lg font-bold text-secondary-900 mb-4">Contact Us</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={getTelLink()}
                  className="flex items-center gap-3 text-sm text-secondary-700 hover:text-primary-700 transition-colors"
                >
                  <Phone size={18} className="text-primary-600" />
                  {siteConfig.phoneDisplay}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-sm text-secondary-700 hover:text-primary-700 transition-colors"
                >
                  <Mail size={18} className="text-primary-600" />
                  {siteConfig.email}
                </a>
                <div className="flex items-start gap-3 text-sm text-secondary-700 sm:col-span-2">
                  <MapPin size={18} className="text-primary-600 mt-0.5 shrink-0" />
                  {siteConfig.address.full}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8"
          >
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!pdfReady}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-primary hover:shadow-glow transition-all disabled:opacity-50"
              aria-label="Download acknowledgement PDF"
            >
              <Download size={18} /> Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
              aria-label="Print acknowledgement"
            >
              <Printer size={18} /> Print
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
              aria-label="Go to home page"
            >
              <Home size={18} /> Back to Home
            </button>
            <a
              href={getTelLink()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
              aria-label="Call college"
            >
              <Phone size={18} /> Call College
            </a>
            <a
              href={getWhatsAppLink(`Hello, I have submitted my admission application. My Application ID is ${applicationId}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-700 transition-all"
              aria-label="Message on WhatsApp"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
