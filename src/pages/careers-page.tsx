import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { fetchActiveCareerJobs, formatCareerDate, type CareerJob } from '@/lib/careers';

export default function CareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchActiveCareerJobs().then((result) => {
      if (!mounted) return;
      setJobs(result.data);
      setError(result.error || '');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join Our Team"
        subtitle="Build your career with Prarthana PU Science College and help shape the next generation of learners."
      />

      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary-50/40" aria-labelledby="career-openings-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              <Briefcase size={16} /> Current Opportunities
            </div>
            <h2 id="career-openings-title" className="text-3xl md:text-4xl font-black text-secondary-900 mb-3">
              Current Openings
            </h2>
            <p className="text-secondary-500 max-w-2xl mx-auto">
              Explore teaching and professional opportunities at Prarthana PU Science College.
            </p>
          </motion.div>

          {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((item) => <div key={item} className="h-72 rounded-2xl bg-white border border-primary-100 shadow-soft animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-primary-100 shadow-soft p-8 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl font-black text-secondary-900 mb-2">No current openings</h3>
              <p className="text-secondary-500">Please check back later for new career opportunities.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid md:grid-cols-2 gap-6"
            >
              {jobs.map((job) => (
                <motion.article key={job.id} variants={fadeInUp} className="bg-white rounded-2xl border border-primary-100 shadow-soft p-6 flex flex-col hover:shadow-glow transition-all">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs font-black text-primary-700 uppercase tracking-wider mb-1">{job.department || 'College Team'}</p>
                      <h3 className="text-2xl font-black text-secondary-900">{job.title}</h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-bold">
                      Active
                    </span>
                  </div>

                  <div className="text-secondary-600 text-sm leading-relaxed mb-5 flex-grow space-y-3">
                    <p>
                      {job.short_description || job.description || 'Join Prarthana PU Science College and contribute to a focused, student-first academic environment.'}
                    </p>
                    {job.responsibilities && (
                      <p>
                        <span className="font-semibold text-secondary-900">Responsibilities:</span> {job.responsibilities}
                      </p>
                    )}
                    {job.required_qualifications && (
                      <p>
                        <span className="font-semibold text-secondary-900">Requirements:</span> {job.required_qualifications}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 text-xs text-secondary-500">
                    <span>Posted {formatCareerDate(job.created_at)}</span>
                    <span>Deadline {formatCareerDate(job.application_deadline)}</span>
                  </div>

                  <Link
                    to={`/careers/${job.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors"
                  >
                    Apply Now <ArrowRight size={18} />
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
