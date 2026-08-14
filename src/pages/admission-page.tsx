import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, GraduationCap, FileText, ChevronLeft, ChevronRight, Check,
  Upload, X, Camera,
} from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import {
  initialAdmissionFormData, validateAdmissionForm, buildSheetRow,
  generateApplicationId, getPassingYears,
  admissionSources, preferredBatches, sslcBoards,
  fileToCompressedDataUrl, type AdmissionFormData,
} from '@/lib/admission-config';
import { submitToGoogleSheets } from '@/lib/google-script-config';
import { submitAdmissionToNeon } from '@/lib/submissions';
import { sendAdmissionEmailNotification } from '@/lib/admission-notification';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Personal Details', icon: User },
  { number: 2, label: 'Academic Info', icon: GraduationCap },
  { number: 3, label: 'Additional Info', icon: FileText },
];

const passingYears = getPassingYears();

export default function AdmissionPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdmissionFormData>(initialAdmissionFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof AdmissionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5 MB');
      return;
    }
    try {
      const compressed = await fileToCompressedDataUrl(file);
      setPhotoPreview(compressed);
      setPhotoName(file.name);
      handleChange('photoDataUrl', compressed);
    } catch {
      setPhotoError('Could not process the image. Please try a different file.');
    }
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setPhotoName('');
    setPhotoError('');
    handleChange('photoDataUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNext = () => {
    const stepErrors = validateAdmissionForm(formData, currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const stepErrors = validateAdmissionForm(formData, currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // `generateApplicationId()` produces the human-readable PPSC reference.
      // Do NOT send this into the DB `application_id` UUID column — it must go
      // into `reference_code`. Allow PostgreSQL to generate `application_id`.
      const applicationId = generateApplicationId();
      const referenceCode = applicationId;
      const submittedAt = new Date().toISOString();
      const status = 'Submitted';

      const admissionPayload = {
        // Omit `application_id` so Postgres uses its `gen_random_uuid()` default.
        reference_code: referenceCode,
        student_name: formData.studentName,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        alternate_mobile: formData.alternateMobile,
        parent_mobile: formData.parentMobile,
        nationality: formData.nationality,
        mother_tongue: formData.motherTongue,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pin_code: formData.pinCode,
        previous_school: formData.previousSchool,
        previous_school_address: formData.previousSchoolAddress,
        sslc_marks: formData.sslcMarks,
        sslc_board: formData.sslcBoard,
        passing_year: formData.passingYear,
        course_interested: formData.courseInterested,
        medium_of_instruction: formData.mediumOfInstruction,
        preferred_batch: formData.preferredBatch,
        religion: formData.religion,
        caste: formData.caste,
        blood_group: formData.bloodGroup,
        aadhaar_number: formData.aadhaarNumber,
        transport_required: formData.transportRequired || 'No',
        hostel_required: formData.hostelRequired || 'No',
        parent_occupation: formData.parentOccupation,
        parent_email: formData.parentEmail,
        emergency_contact: formData.emergencyContact,
        annual_family_income: formData.annualFamilyIncome,
        admission_source: formData.admissionSource,
        message: formData.message,
        photo_url: formData.photoDataUrl || null,
        submitted_at: submittedAt,
        created_at: submittedAt,
        status,
      };

      const dbResult = await submitAdmissionToNeon(admissionPayload);
      if (!dbResult.success) {
        setSubmitError(dbResult.error || 'Your application could not be saved. Please try again.');
        setSubmitting(false);
        return;
      }

      // Non-blocking Google Sheets sync attempt
      try {
        const sheetRow = buildSheetRow(formData, applicationId, referenceCode, submittedAt);
        const sheetResult = await submitToGoogleSheets(sheetRow);
        if (!sheetResult.success) {
          console.warn('Background Google Sheets sync notice:', sheetResult.error);
        }
      } catch (sheetErr) {
        console.warn('Background Google Sheets sync exception:', sheetErr);
      }

      // PDF data structure
      const pdfData: import('@/lib/pdf-generator').PDFData = {
        applicationId,
        referenceCode,
        submittedAt,
        status,
        formData,
        qrDataUrl: '',
      };

      // Automatically generate SECOND PDF (Reception Dossier PDF - INTERNAL ONLY for college records)
      try {
        const { generateReceptionPDFBlob } = await import('@/lib/pdf-generator');
        void generateReceptionPDFBlob(pdfData);
      } catch {
        /* background reception pdf creation */
      }

      // Email notification
      void sendAdmissionEmailNotification(pdfData, {
        studentName: formData.studentName,
        applicationId,
        referenceCode,
        courseInterested: formData.courseInterested,
        mobileNumber: formData.mobileNumber,
        submittedAt,
        status,
        email: formData.email,
      });

      navigate('/admission-success', {
        state: {
          applicationId,
          referenceCode,
          submittedAt,
          status,
          formData,
        },
        replace: true,
      });
    } catch (err) {
      const isNetworkError = !navigator.onLine || (err instanceof Error && /fetch|network/i.test(err.message));
      setSubmitError(isNetworkError
        ? 'Your application could not be submitted. Please check your internet connection and try again.'
        : 'An unexpected error occurred. Please try again or contact the college directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all';
  const labelClass = 'block text-sm font-semibold text-secondary-700 mb-1.5';

  return (
    <>
      <PageHero
        eyebrow="Admissions Open 2026-27"
        title="Apply for Admission"
        subtitle="Complete the application form below to begin your journey at Prarthana PU Science College."
      />

      <section className="py-16 md:py-24" aria-labelledby="admission-form-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="admission-form-title" className="sr-only">Admission Application Form</h2>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isComplete = currentStep > step.number;
                return (
                  <div key={step.number} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                          isComplete
                            ? 'bg-gradient-primary text-white'
                            : isActive
                              ? 'bg-gradient-accent text-white ring-4 ring-accent-100'
                              : 'bg-secondary-100 text-secondary-400'
                        )}
                      >
                        {isComplete ? <Check size={24} /> : <StepIcon size={20} />}
                      </div>
                      <span className={cn(
                        'text-xs font-semibold text-center hidden sm:block',
                        isActive || isComplete ? 'text-secondary-900' : 'text-secondary-400'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-1 mx-2 rounded-full bg-secondary-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            currentStep > step.number ? 'bg-gradient-primary w-full' : 'w-0'
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <motion.form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 3) {
                handleSubmit();
              } else {
                handleNext();
              }
            }}
            className="bg-white rounded-3xl p-6 md:p-10 shadow-soft"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-bold text-secondary-900 mb-4">Personal Details</h3>

                  <div>
                    <label htmlFor="studentName" className={labelClass}>Student Name <span className="text-error-500">*</span></label>
                    <input
                      id="studentName"
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => handleChange('studentName', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.studentName}
                    />
                    {errors.studentName && <p className="text-error-500 text-xs mt-1">{errors.studentName}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="fatherName" className={labelClass}>Father's Name <span className="text-error-500">*</span></label>
                      <input
                        id="fatherName"
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.fatherName}
                      />
                      {errors.fatherName && <p className="text-error-500 text-xs mt-1">{errors.fatherName}</p>}
                    </div>
                    <div>
                      <label htmlFor="motherName" className={labelClass}>Mother's Name <span className="text-error-500">*</span></label>
                      <input
                        id="motherName"
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => handleChange('motherName', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.motherName}
                      />
                      {errors.motherName && <p className="text-error-500 text-xs mt-1">{errors.motherName}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth <span className="text-error-500">*</span></label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.dateOfBirth}
                      />
                      {errors.dateOfBirth && <p className="text-error-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                    </div>
                    <div>
                      <label htmlFor="gender" className={labelClass}>Gender <span className="text-error-500">*</span></label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.gender}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <p className="text-error-500 text-xs mt-1">{errors.gender}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="nationality" className={labelClass}>Nationality <span className="text-error-500">*</span></label>
                      <input
                        id="nationality"
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.nationality}
                      />
                      {errors.nationality && <p className="text-error-500 text-xs mt-1">{errors.nationality}</p>}
                    </div>
                    <div>
                      <label htmlFor="motherTongue" className={labelClass}>Mother Tongue <span className="text-error-500">*</span></label>
                      <input
                        id="motherTongue"
                        type="text"
                        value={formData.motherTongue}
                        onChange={(e) => handleChange('motherTongue', e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Kannada, Hindi, English"
                        aria-required="true"
                        aria-invalid={!!errors.motherTongue}
                      />
                      {errors.motherTongue && <p className="text-error-500 text-xs mt-1">{errors.motherTongue}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>Email <span className="text-error-500">*</span></label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-error-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="mobileNumber" className={labelClass}>Mobile Number <span className="text-error-500">*</span></label>
                      <input
                        id="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => handleChange('mobileNumber', e.target.value)}
                        className={inputClass}
                        maxLength={10}
                        aria-required="true"
                        aria-invalid={!!errors.mobileNumber}
                      />
                      {errors.mobileNumber && <p className="text-error-500 text-xs mt-1">{errors.mobileNumber}</p>}
                    </div>
                    <div>
                      <label htmlFor="parentMobile" className={labelClass}>Parent Mobile <span className="text-error-500">*</span></label>
                      <input
                        id="parentMobile"
                        type="tel"
                        value={formData.parentMobile}
                        onChange={(e) => handleChange('parentMobile', e.target.value)}
                        className={inputClass}
                        maxLength={10}
                        aria-required="true"
                        aria-invalid={!!errors.parentMobile}
                      />
                      {errors.parentMobile && <p className="text-error-500 text-xs mt-1">{errors.parentMobile}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="alternateMobile" className={labelClass}>Alternate Mobile <span className="text-secondary-400 font-normal">(optional)</span></label>
                    <input
                      id="alternateMobile"
                      type="tel"
                      value={formData.alternateMobile}
                      onChange={(e) => handleChange('alternateMobile', e.target.value)}
                      className={inputClass}
                      maxLength={10}
                      aria-invalid={!!errors.alternateMobile}
                    />
                    {errors.alternateMobile && <p className="text-error-500 text-xs mt-1">{errors.alternateMobile}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Academic Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-bold text-secondary-900 mb-4">Academic Information</h3>

                  <div>
                    <label htmlFor="address" className={labelClass}>Address <span className="text-error-500">*</span></label>
                    <textarea
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && <p className="text-error-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label htmlFor="city" className={labelClass}>City <span className="text-error-500">*</span></label>
                      <input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.city}
                      />
                      {errors.city && <p className="text-error-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="district" className={labelClass}>District <span className="text-error-500">*</span></label>
                      <input
                        id="district"
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.district}
                      />
                      {errors.district && <p className="text-error-500 text-xs mt-1">{errors.district}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className={labelClass}>State <span className="text-error-500">*</span></label>
                      <input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.state}
                      />
                      {errors.state && <p className="text-error-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label htmlFor="pinCode" className={labelClass}>PIN Code <span className="text-error-500">*</span></label>
                      <input
                        id="pinCode"
                        type="text"
                        inputMode="numeric"
                        value={formData.pinCode}
                        onChange={(e) => handleChange('pinCode', e.target.value)}
                        className={inputClass}
                        maxLength={6}
                        placeholder="6-digit PIN"
                        aria-required="true"
                        aria-invalid={!!errors.pinCode}
                      />
                      {errors.pinCode && <p className="text-error-500 text-xs mt-1">{errors.pinCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="previousSchool" className={labelClass}>Previous School Name <span className="text-error-500">*</span></label>
                    <input
                      id="previousSchool"
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => handleChange('previousSchool', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.previousSchool}
                    />
                    {errors.previousSchool && <p className="text-error-500 text-xs mt-1">{errors.previousSchool}</p>}
                  </div>

                  <div>
                    <label htmlFor="previousSchoolAddress" className={labelClass}>Previous School Address <span className="text-error-500">*</span></label>
                    <textarea
                      id="previousSchoolAddress"
                      rows={2}
                      value={formData.previousSchoolAddress}
                      onChange={(e) => handleChange('previousSchoolAddress', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.previousSchoolAddress}
                    />
                    {errors.previousSchoolAddress && <p className="text-error-500 text-xs mt-1">{errors.previousSchoolAddress}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="sslcMarks" className={labelClass}>SSLC Marks / Percentage <span className="text-error-500">*</span></label>
                      <input
                        id="sslcMarks"
                        type="text"
                        inputMode="decimal"
                        value={formData.sslcMarks}
                        onChange={(e) => handleChange('sslcMarks', e.target.value)}
                        className={inputClass}
                        placeholder="e.g. 95.5"
                        aria-required="true"
                        aria-invalid={!!errors.sslcMarks}
                      />
                      {errors.sslcMarks && <p className="text-error-500 text-xs mt-1">{errors.sslcMarks}</p>}
                    </div>
                    <div>
                      <label htmlFor="sslcBoard" className={labelClass}>SSLC Board <span className="text-error-500">*</span></label>
                      <select
                        id="sslcBoard"
                        value={formData.sslcBoard}
                        onChange={(e) => handleChange('sslcBoard', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.sslcBoard}
                      >
                        <option value="">Select Board</option>
                        {sslcBoards.map((board) => (
                          <option key={board} value={board}>{board}</option>
                        ))}
                      </select>
                      {errors.sslcBoard && <p className="text-error-500 text-xs mt-1">{errors.sslcBoard}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="passingYear" className={labelClass}>Passing Year <span className="text-error-500">*</span></label>
                      <select
                        id="passingYear"
                        value={formData.passingYear}
                        onChange={(e) => handleChange('passingYear', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.passingYear}
                      >
                        <option value="">Select Year</option>
                        {passingYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.passingYear && <p className="text-error-500 text-xs mt-1">{errors.passingYear}</p>}
                    </div>
                    <div>
                      <label htmlFor="courseInterested" className={labelClass}>Course Interested <span className="text-error-500">*</span></label>
                      <select
                        id="courseInterested"
                        value={formData.courseInterested}
                        onChange={(e) => handleChange('courseInterested', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.courseInterested}
                      >
                        <option value="">Select Course</option>
                        <option value="PCMB">PCMB</option>
                        <option value="PCMC">PCMC</option>
                      </select>
                      {errors.courseInterested && <p className="text-error-500 text-xs mt-1">{errors.courseInterested}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="mediumOfInstruction" className={labelClass}>Medium of Instruction <span className="text-error-500">*</span></label>
                      <select
                        id="mediumOfInstruction"
                        value={formData.mediumOfInstruction}
                        onChange={(e) => handleChange('mediumOfInstruction', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.mediumOfInstruction}
                      >
                        <option value="">Select Medium</option>
                        <option value="English">English</option>
                        <option value="Kannada">Kannada</option>
                      </select>
                      {errors.mediumOfInstruction && <p className="text-error-500 text-xs mt-1">{errors.mediumOfInstruction}</p>}
                    </div>
                    <div>
                      <label htmlFor="preferredBatch" className={labelClass}>Preferred Batch <span className="text-error-500">*</span></label>
                      <select
                        id="preferredBatch"
                        value={formData.preferredBatch}
                        onChange={(e) => handleChange('preferredBatch', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.preferredBatch}
                      >
                        <option value="">Select Batch</option>
                        {preferredBatches.map((batch) => (
                          <option key={batch} value={batch}>{batch}</option>
                        ))}
                      </select>
                      {errors.preferredBatch && <p className="text-error-500 text-xs mt-1">{errors.preferredBatch}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Additional Info */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-bold text-secondary-900 mb-4">Additional Information</h3>

                  {/* Student Photo Upload (optional) */}
                  <div>
                    <label className={labelClass}>Student Photo <span className="text-secondary-400 font-normal">(optional)</span></label>
                    <input
                      ref={fileInputRef}
                      id="studentPhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                    {photoPreview ? (
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-secondary-200 bg-secondary-50">
                        <img src={photoPreview} alt="Student preview" className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">{photoName}</p>
                          <p className="text-xs text-secondary-500">Photo uploaded successfully</p>
                        </div>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-2 rounded-lg text-secondary-500 hover:text-error-500 hover:bg-error-50 transition-colors"
                          aria-label="Remove photo"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-secondary-300 hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                          <Camera className="text-primary-600" size={24} />
                        </div>
                        <span className="text-sm font-semibold text-secondary-700">Click to upload student photo</span>
                        <span className="text-xs text-secondary-400 flex items-center gap-1">
                          <Upload size={12} /> JPG or PNG, max 5 MB
                        </span>
                      </button>
                    )}
                    {photoError && <p className="text-error-500 text-xs mt-1">{photoError}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="religion" className={labelClass}>Religion <span className="text-error-500">*</span></label>
                      <input
                        id="religion"
                        type="text"
                        value={formData.religion}
                        onChange={(e) => handleChange('religion', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.religion}
                      />
                      {errors.religion && <p className="text-error-500 text-xs mt-1">{errors.religion}</p>}
                    </div>
                    <div>
                      <label htmlFor="caste" className={labelClass}>Caste <span className="text-error-500">*</span></label>
                      <input
                        id="caste"
                        type="text"
                        value={formData.caste}
                        onChange={(e) => handleChange('caste', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.caste}
                      />
                      {errors.caste && <p className="text-error-500 text-xs mt-1">{errors.caste}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="bloodGroup" className={labelClass}>Blood Group <span className="text-error-500">*</span></label>
                      <select
                        id="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.bloodGroup}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      {errors.bloodGroup && <p className="text-error-500 text-xs mt-1">{errors.bloodGroup}</p>}
                    </div>
                    <div>
                      <label htmlFor="aadhaarNumber" className={labelClass}>Aadhaar Number <span className="text-secondary-400 font-normal">(optional)</span></label>
                      <input
                        id="aadhaarNumber"
                        type="text"
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                        className={inputClass}
                        maxLength={12}
                        placeholder="12-digit Aadhaar number"
                        aria-required="true"
                        aria-invalid={!!errors.aadhaarNumber}
                      />
                      {errors.aadhaarNumber && <p className="text-error-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="transportRequired" className={labelClass}>Transport Required <span className="text-secondary-400 font-normal">(optional)</span></label>
                      <select
                        id="transportRequired"
                        value={formData.transportRequired}
                        onChange={(e) => handleChange('transportRequired', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.transportRequired}
                      >
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.transportRequired && <p className="text-error-500 text-xs mt-1">{errors.transportRequired}</p>}
                    </div>
                    <div>
                      <label htmlFor="hostelRequired" className={labelClass}>Hostel Required <span className="text-secondary-400 font-normal">(optional)</span></label>
                      <select
                        id="hostelRequired"
                        value={formData.hostelRequired}
                        onChange={(e) => handleChange('hostelRequired', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.hostelRequired}
                      >
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.hostelRequired && <p className="text-error-500 text-xs mt-1">{errors.hostelRequired}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="parentOccupation" className={labelClass}>Parent's Occupation <span className="text-error-500">*</span></label>
                      <input
                        id="parentOccupation"
                        type="text"
                        value={formData.parentOccupation}
                        onChange={(e) => handleChange('parentOccupation', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.parentOccupation}
                      />
                      {errors.parentOccupation && <p className="text-error-500 text-xs mt-1">{errors.parentOccupation}</p>}
                    </div>
                    <div>
                      <label htmlFor="parentEmail" className={labelClass}>Parent Email <span className="text-secondary-400 font-normal">(optional)</span></label>
                      <input
                        id="parentEmail"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => handleChange('parentEmail', e.target.value)}
                        className={inputClass}
                        aria-required="true"
                        aria-invalid={!!errors.parentEmail}
                      />
                      {errors.parentEmail && <p className="text-error-500 text-xs mt-1">{errors.parentEmail}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="emergencyContact" className={labelClass}>Emergency Contact Number <span className="text-error-500">*</span></label>
                      <input
                        id="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => handleChange('emergencyContact', e.target.value)}
                        className={inputClass}
                        maxLength={10}
                        aria-required="true"
                        aria-invalid={!!errors.emergencyContact}
                      />
                      {errors.emergencyContact && <p className="text-error-500 text-xs mt-1">{errors.emergencyContact}</p>}
                    </div>
                    <div>
                      <label htmlFor="annualFamilyIncome" className={labelClass}>Annual Family Income <span className="text-secondary-400 font-normal">(optional)</span></label>
                      <input
                        id="annualFamilyIncome"
                        type="text"
                        value={formData.annualFamilyIncome}
                        onChange={(e) => handleChange('annualFamilyIncome', e.target.value)}
                        className={inputClass}
                        placeholder="e.g. 5,00,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="admissionSource" className={labelClass}>How did you hear about us? <span className="text-error-500">*</span></label>
                    <select
                      id="admissionSource"
                      value={formData.admissionSource}
                      onChange={(e) => handleChange('admissionSource', e.target.value)}
                      className={inputClass}
                      aria-required="true"
                      aria-invalid={!!errors.admissionSource}
                    >
                      <option value="">Select Source</option>
                      {admissionSources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                    {errors.admissionSource && <p className="text-error-500 text-xs mt-1">{errors.admissionSource}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClass}>Message <span className="text-secondary-400 font-normal">(optional)</span></label>
                    <textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={inputClass}
                      placeholder="Any additional information you'd like to share with us..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Error */}
            {submitError && (
              <div className="mt-6 p-4 rounded-xl bg-error-50 border border-error-200" role="alert">
                <p className="text-error-700 text-sm font-semibold">{submitError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors disabled:opacity-50"
                  aria-label="Go to previous step"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
              ) : (
                <span />
              )}

              {currentStep < 3 ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-primary hover:shadow-glow transition-all"
                  aria-label="Go to next step"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-accent hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit application"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}
