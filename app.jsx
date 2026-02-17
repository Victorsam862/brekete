// ============================================================
// Jobs Brekete — app.jsx
// Single React file: Public Website + Admin Dashboard
// ============================================================
const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ── STORAGE KEYS ────────────────────────────────────────────
const SK = {
  jobs:        'jb_live_jobs',
  submissions: 'jb_submissions',
  employers:   'jb_employers',
  subscribers: 'jb_subscribers',
  adminPass:   'jb_admin_pass',
  adminUser:   'jb_admin_user',
  session:     'jb_admin_session',
};

// ── STORAGE HELPERS ──────────────────────────────────────────
const store = {
  get: (k, fallback = []) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn(e); } },
};

// ── DEFAULT JOBS DATA ────────────────────────────────────────
const DEFAULT_JOBS = [
  { id:'j1', title:'Experienced Griller', company:'Lagos Grill House', location:'Lekki Phase 1, Lagos', type:'Full-Time', typeClass:'full-time', category:'hospitality', salary:'₦80,000 – ₦120,000/month', description:'Seeking a skilled griller with at least 2 years of experience. Must be able to prepare a variety of grilled items to high standards.', contact:'08012345678', date:'2025-06-12', featured:true },
  { id:'j2', title:'Live-in Housekeeper / Nanny', company:'Private Family', location:'Magodo, Lagos', type:'Live-In', typeClass:'live-in', category:'domestic', salary:'₦50,000 – ₦70,000/month + Accommodation', description:'Responsible, experienced housekeeper/nanny needed for a family of 4. Must be comfortable with childcare and general housekeeping duties.', contact:'nanny@jobsbrekete.com', date:'2025-06-13', featured:true },
  { id:'j3', title:'Live-in Nanny', company:'Private Household', location:'Surulere, Lagos', type:'Live-In', typeClass:'live-in', category:'domestic', salary:'₦45,000/month + Accommodation', description:'Trustworthy and caring nanny needed for toddler. Must have experience with children under 5 and be willing to reside with the family.', contact:'08098765432', date:'2025-06-13', featured:false },
  { id:'j4', title:'Personal Driver', company:'Executive Household', location:'Lekki, Lagos', type:'Full-Time', typeClass:'full-time', category:'driving', salary:'₦90,000 – ₦130,000/month', description:'Experienced and licensed personal driver needed for a professional executive. Must know Lagos routes well, be punctual and discreet.', contact:'07011112222', date:'2025-06-11', featured:true },
  { id:'j5', title:'Office Cleaners (x3)', company:'CleanCo Services', location:'Ogudu, Lagos', type:'Full-Time', typeClass:'full-time', category:'domestic', salary:'₦40,000/month', description:'Three cleaners needed for a busy office complex in Ogudu. Morning shift. Must be hardworking and available Monday – Saturday.', contact:'cleancoservices@gmail.com', date:'2025-06-14', featured:false },
  { id:'j6', title:'Male Baker', company:'Sweetbakes Artisan Bakery', location:'Ikate, Lagos', type:'Full-Time', typeClass:'full-time', category:'hospitality', salary:'₦85,000 – ₦110,000/month', description:'Skilled male baker needed for a growing artisan bakery. Must have experience with breads, pastries and cakes. Early morning shifts.', contact:'09033334444', date:'2025-06-10', featured:false },
  { id:'j7', title:'Security Guard', company:'SafeGuard Nigeria Ltd', location:'Victoria Island, Lagos', type:'Full-Time', typeClass:'full-time', category:'security', salary:'₦55,000 – ₦75,000/month', description:'Vigilant security personnel needed for a commercial building on Victoria Island. Day and night shifts available. OND preferred.', contact:'hr@safeguardnigeria.com', date:'2025-06-09', featured:false },
  { id:'j8', title:'Private Lesson Teacher (Maths & English)', company:'EduLink Tutors', location:'Isolo, Lagos', type:'Part-Time', typeClass:'', category:'teaching', salary:'₦3,500 – ₦5,000 per session', description:'Qualified teacher needed to give private lessons in Maths and English to secondary school students. 3 days a week, flexible hours.', contact:'08155556666', date:'2025-06-08', featured:false },
  { id:'j9', title:'Housekeeper', company:'Private Residence', location:'Ogudu-Abesan, Lagos', type:'Full-Time', typeClass:'full-time', category:'domestic', salary:'₦45,000/month', description:'Diligent housekeeper needed for a large family home. Duties include cooking, cleaning, laundry. Previous experience required.', contact:'07066667777', date:'2025-06-14', featured:false },
  { id:'j10', title:'Front Desk Officer', company:'Heritage Place Hotel', location:'Victoria Island, Lagos', type:'Full-Time', typeClass:'full-time', category:'admin', salary:'₦100,000 – ₦150,000/month', description:'Professional and presentable front desk officer needed for a boutique hotel. Must have good communication skills and experience in hospitality.', contact:'careers@heritageplace.com', date:'2025-06-07', featured:true },
  { id:'j11', title:'Van / Bus Driver', company:'Swift Logistics Co.', location:'Oshodi, Lagos', type:'Full-Time', typeClass:'full-time', category:'driving', salary:'₦75,000/month', description:'Experienced van or bus driver needed for goods delivery across Lagos. Must have valid driving licence and minimum 3 years experience.', contact:'08077778888', date:'2025-06-06', featured:false },
  { id:'j12', title:'Administrative Assistant', company:'NovaTech Solutions', location:'Abuja, FCT', type:'Full-Time', typeClass:'full-time', category:'admin', salary:'₦120,000 – ₦180,000/month', description:'Detail-oriented administrative assistant needed for a tech firm in Abuja. Proficiency in MS Office required. Minimum HND qualification.', contact:'jobs@novatechng.com', date:'2025-06-05', featured:false },
];

// ── UTILITIES ────────────────────────────────────────────────
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }); } catch { return iso; } };
const fmtDateTime = (iso) => { try { return new Date(iso).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); } catch { return iso || '—'; } };
const genId = () => 'j' + Date.now() + Math.random().toString(36).slice(2,5);
const typeClass = (t) => { const m = { 'full-time':'full-time','live-in':'live-in','contract':'contract','part-time':'' }; return m[(t||'').toLowerCase()] || ''; };

// ── INITIAL JOBS SEED ────────────────────────────────────────
function seedJobs() {
  const existing = store.get(SK.jobs, null);
  if (existing === null) store.set(SK.jobs, DEFAULT_JOBS);
}

// ── TOAST HOOK ───────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return [toast, show];
}

// ── TOAST COMPONENT ───────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success:'#22c55e', warning:'#f59e0b', danger:'#ef4444', info:'#3b82f6' };
  return (
    <div className="toast" style={{ background: colors[toast.type] || colors.success }}>
      {toast.msg}
    </div>
  );
}

// ── MODAL COMPONENT ───────────────────────────────────────────
function Modal({ onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onClose]);
  return (
    <div className="modal-wrap">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">{children}</div>
    </div>
  );
}

// ============================================================
// ██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗
// ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝
// ██████╔╝██║   ██║██████╔╝██║     ██║██║
// ██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║
// ██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗
// ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝
// PUBLIC WEBSITE COMPONENTS
// ============================================================

// ── NAVBAR ───────────────────────────────────────────────────
function Navbar({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const nav = (id) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); };
  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#home" className="logo" onClick={() => nav('home')}>
          <span className="logo-icon">JB</span>
          <span className="logo-text">Jobs<span className="accent">Brekete</span></span>
        </a>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <span /><span /><span />
        </button>
        <ul className={`nav-links${open ? ' open' : ''}`}>
          {[['home','Home'],['jobs','Browse Jobs'],['post-job','Post a Job'],['how-it-works','How It Works'],['about','About'],['contact','Contact']].map(([id,label]) => (
            <li key={id}><a className="nav-link" onClick={() => nav(id)} href={`#${id}`}>{label}</a></li>
          ))}
          <li><a className="btn btn-accent nav-cta" onClick={() => nav('post-job')} href="#post-job">Post a Vacancy</a></li>
        </ul>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────
function Hero() {
  const nav = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  return (
    <section className="hero" id="home">
      <div className="hero-bg-shapes" aria-hidden="true">
        <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" />
      </div>
      <div className="container hero-content">
        <div className="hero-badge">🇳🇬 Nigeria's Trusted Job Board</div>
        <h1>Find Verified Job Vacancies <span className="accent">Across Nigeria</span></h1>
        <p className="hero-sub">Browse Daily Job Listings &amp; Career Opportunities – Updated Regularly.<br />From Lekki to Abuja, your next opportunity is here.</p>
        <div className="hero-ctas">
          <button className="btn btn-accent btn-lg" onClick={() => nav('jobs')}>Browse Jobs</button>
          <button className="btn btn-outline btn-lg" onClick={() => nav('post-job')}>Submit a Vacancy</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Active Listings</span></div>
          <div className="stat-divider" /><div className="stat"><span className="stat-num">10k+</span><span className="stat-label">Job Seekers</span></div>
          <div className="stat-divider" /><div className="stat"><span className="stat-num">Daily</span><span className="stat-label">New Postings</span></div>
        </div>
      </div>
    </section>
  );
}

// ── INTRO STRIP ───────────────────────────────────────────────
function IntroStrip() {
  return (
    <section className="intro-strip">
      <div className="container intro-inner">
        <p><strong>Jobs Brekete</strong> is Nigeria's trusted job listing platform where employers, recruiters, and staffing agencies post verified vacancies daily. Whether you're a job seeker looking for your next opportunity or a recruiter searching for qualified candidates, Jobs Brekete connects you fast — no stress, no gatekeeping.</p>
      </div>
    </section>
  );
}

// ── JOB CARD ─────────────────────────────────────────────────
function JobCard({ job, onView }) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <span className={`job-tag ${job.typeClass || ''}`}>{job.type}</span>
        <span className="job-date">📅 {fmtDate(job.date)}</span>
      </div>
      <div>
        <h3 className="job-title-text">{job.title}</h3>
        <p className="job-company">🏢 {job.company}</p>
      </div>
      <div className="job-meta">
        <span className="job-meta-item"><span className="icon">📍</span>{job.location}</span>
        <span className="job-meta-item"><span className="icon">💼</span>{job.type}</span>
      </div>
      <div className="job-salary">💰 {job.salary}</div>
      <div className="job-card-actions">
        <a href={`tel:${job.contact}`} className="btn btn-accent">Apply Now</a>
        <button className="btn btn-outline" onClick={() => onView(job)}>View Details</button>
      </div>
    </article>
  );
}

// ── JOB DETAIL MODAL ──────────────────────────────────────────
function JobDetailModal({ job, onClose }) {
  return (
    <Modal onClose={onClose}>
      <button className="modal-close-btn" onClick={onClose}>✕</button>
      <span className={`job-tag ${job.typeClass || ''}`}>{job.type}</span>
      <h2 className="modal-title">{job.title}</h2>
      <p className="modal-company">🏢 {job.company}</p>
      <div className="modal-meta">
        <span>📍 {job.location}</span>
        <span>💰 {job.salary}</span>
        <span>📅 {fmtDate(job.date)}</span>
      </div>
      <div className="modal-desc"><h4>Job Description</h4><p>{job.description}</p></div>
      <div className="modal-actions">
        <a href={`tel:${job.contact}`} className="btn btn-accent btn-lg">Apply Now</a>
        <a href={`mailto:${job.contact}`} className="btn btn-outline btn-lg">Send Email</a>
      </div>
    </Modal>
  );
}

// ── JOBS SECTION ──────────────────────────────────────────────
function JobsSection({ jobs }) {
  const [query, setQuery] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [visible, setVisible] = useState(6);
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter(j =>
      (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.description||'').toLowerCase().includes(q)) &&
      (!locFilter || j.location.toLowerCase().includes(locFilter)) &&
      (!typeFilter || j.type.toLowerCase().includes(typeFilter)) &&
      (!catFilter || j.category === catFilter)
    );
  }, [jobs, query, locFilter, typeFilter, catFilter]);

  const toShow = filtered.slice(0, visible);

  return (
    <section className="jobs-section" id="jobs">
      <div className="container">
        <div className="section-header">
          <h2>Latest Job Vacancies in <span className="accent">Nigeria</span></h2>
          <p>Fresh listings updated daily across Lagos, Abuja, and other states.</p>
        </div>
        <div className="filter-bar">
          <input className="filter-input" value={query} onChange={e => { setQuery(e.target.value); setVisible(6); }} placeholder="🔍 Search by job title or keyword..." />
          <select className="filter-select" value={locFilter} onChange={e => { setLocFilter(e.target.value); setVisible(6); }}>
            <option value="">📍 All Locations</option>
            {['lekki','surulere','magodo','ogudu','isolo','ikate','oshodi','victoria island','abuja'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
          </select>
          <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setVisible(6); }}>
            <option value="">💼 All Job Types</option>
            {['Full-Time','Part-Time','Contract','Live-In'].map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
          </select>
          <select className="filter-select" value={catFilter} onChange={e => { setCatFilter(e.target.value); setVisible(6); }}>
            <option value="">🏷️ All Categories</option>
            {[['hospitality','Hospitality'],['domestic','Domestic/Household'],['driving','Driving'],['security','Security'],['teaching','Teaching'],['admin','Admin/Office'],['trade','Trade/Skilled']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {toShow.length === 0
          ? <div className="no-results"><p>😔 No jobs found matching your search. Try different filters.</p></div>
          : <div className="jobs-grid">{toShow.map(job => <JobCard key={job.id} job={job} onView={setSelectedJob} />)}</div>
        }
        {visible < filtered.length && (
          <div className="load-more-wrap">
            <button className="btn btn-outline" onClick={() => setVisible(v => v + 6)}>Load More Jobs</button>
          </div>
        )}
        {/* Job Alert Bar */}
        <JobAlertBar />
      </div>
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </section>
  );
}

// ── JOB ALERT BAR ────────────────────────────────────────────
function JobAlertBar() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const subs = store.get(SK.subscribers, []);
    if (!subs.find(s => s.email === email)) {
      subs.push({ email, subscribedAt: new Date().toISOString() });
      store.set(SK.subscribers, subs);
    }
    setEmail(''); setDone(true);
    setTimeout(() => setDone(false), 5000);
  };
  return (
    <div className="job-alert-bar">
      <p>🔔 <strong>Get Job Alerts!</strong> Enter your email to receive daily job updates in Lagos &amp; Nigeria.</p>
      <form className="alert-form" onSubmit={submit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" />
        <button type="submit" className="btn btn-accent">Subscribe</button>
      </form>
      {done && <p className="alert-success">✅ Subscribed! You'll receive daily job alerts.</p>}
    </div>
  );
}

// ── POST A JOB ────────────────────────────────────────────────
function PostJobSection({ onShowToast }) {
  const empty = { jobTitle:'', companyName:'', location:'', jobType:'', description:'', salary:'', email:'', phone:'', expiryDate:'' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required.';
    if (!form.companyName.trim()) e.companyName = 'Company name is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.jobType) e.jobType = 'Please select a job type.';
    if (!form.description.trim()) e.description = 'Job description is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid contact email is required.';
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      // Save submission
      const subs = store.get(SK.submissions, []);
      const id = genId();
      subs.push({ id, ...form, status:'pending', submittedAt: new Date().toISOString() });
      store.set(SK.submissions, subs);
      // Save employer contact
      const emps = store.get(SK.employers, []);
      const ei = emps.findIndex(em => em.email === form.email);
      if (ei !== -1) { emps[ei].lastSubmission = new Date().toISOString(); emps[ei].companyName = form.companyName; }
      else emps.push({ companyName: form.companyName, email: form.email, phone: form.phone, lastSubmission: new Date().toISOString() });
      store.set(SK.employers, emps);
      setForm(empty); setLoading(false); setSuccess(true);
      onShowToast('✅ Vacancy submitted! We\'ll review it within 24 hours.', 'success');
      setTimeout(() => setSuccess(false), 6000);
    }, 1200);
  };

  const fi = (k) => ({ value: form[k], onChange: update(k) });

  return (
    <section className="post-job-section" id="post-job">
      <div className="container">
        <div className="section-header light">
          <h2>Post a Job Vacancy</h2>
          <p>Reach thousands of qualified job seekers across Nigeria. Fill out the form below.</p>
        </div>
        <form className="post-form" onSubmit={submit} noValidate>
          <div className="form-row">
            <FormField label="Job Title" required error={errors.jobTitle}><input type="text" placeholder="e.g. Experienced Cook" {...fi('jobTitle')} /></FormField>
            <FormField label="Company / Recruiter Name" required error={errors.companyName}><input type="text" placeholder="e.g. Bright Star Hospitality" {...fi('companyName')} /></FormField>
          </div>
          <div className="form-row">
            <FormField label="Location" required error={errors.location}><input type="text" placeholder="e.g. Lekki Phase 1, Lagos" {...fi('location')} /></FormField>
            <FormField label="Job Type" required error={errors.jobType}>
              <select {...fi('jobType')}>
                <option value="">Select job type</option>
                {['Full-Time','Part-Time','Contract','Live-In'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Job Description" required error={errors.description}><textarea rows={5} placeholder="Describe the role, responsibilities, requirements..." {...fi('description')} /></FormField>
          <div className="form-row">
            <FormField label="Salary / Pay Range"><input type="text" placeholder="e.g. ₦80,000 – ₦120,000/month" {...fi('salary')} /></FormField>
            <FormField label="Listing Expiry Date"><input type="date" {...fi('expiryDate')} /></FormField>
          </div>
          <div className="form-row">
            <FormField label="Contact Email" required error={errors.email}><input type="email" placeholder="recruiter@example.com" {...fi('email')} /></FormField>
            <FormField label="Contact Phone"><input type="tel" placeholder="e.g. 0801 234 5678" {...fi('phone')} /></FormField>
          </div>
          <div className="form-submit-row">
            <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>{loading ? 'Submitting…' : 'Submit Vacancy'}</button>
            <p className="form-note">All vacancies are reviewed before publishing. You'll receive a confirmation within 24 hours.</p>
          </div>
          {success && <div className="form-success">✅ Your vacancy has been submitted successfully! We'll review and publish it shortly.</div>}
        </form>
      </div>
    </section>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span className="required" aria-hidden="true"> *</span>}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────
function HowItWorks() {
  const nav = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header"><h2>How <span className="accent">It Works</span></h2><p>Simple, fast, and free for job seekers.</p></div>
        <div className="hiw-grid">
          <div className="hiw-card">
            <div className="hiw-icon">👩‍💼</div>
            <h3>For Job Seekers</h3>
            <ol className="hiw-steps">
              <li><span className="step-num">1</span>Browse available job listings</li>
              <li><span className="step-num">2</span>Filter by location, type, or salary</li>
              <li><span className="step-num">3</span>Apply via the contact details or Apply Now button</li>
            </ol>
            <button className="btn btn-accent" onClick={() => nav('jobs')}>Browse Jobs Now</button>
          </div>
          <div className="hiw-divider" />
          <div className="hiw-card">
            <div className="hiw-icon">🏢</div>
            <h3>For Employers &amp; Recruiters</h3>
            <ol className="hiw-steps">
              <li><span className="step-num">1</span>Submit your vacancy details</li>
              <li><span className="step-num">2</span>We review and publish your listing</li>
              <li><span className="step-num">3</span>Receive applications and inquiries directly</li>
            </ol>
            <button className="btn btn-outline" onClick={() => nav('post-job')}>Post a Vacancy</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ABOUT ────────────────────────────────────────────────────
function About() {
  const nav = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  return (
    <section className="about-section" id="about">
      <div className="container about-inner">
        <div className="about-text">
          <h2>About <span className="accent">Jobs Brekete</span></h2>
          <p>Jobs Brekete is a free, community-driven job listing platform dedicated to connecting job seekers with employers across Nigeria — especially in Lagos, Abuja, and key economic hubs.</p>
          <p>Our mission is simple: <strong>make employment opportunities accessible to everyone</strong>. We curate and publish daily job posts across all sectors.</p>
          <ul className="about-features">
            <li>✅ Curated daily job posts across all sectors</li>
            <li>✅ Connects employers with qualified candidates fast</li>
            <li>✅ Free for all job seekers</li>
            <li>✅ CV writing support available (via our community)</li>
            <li>✅ Active Facebook &amp; Instagram job community</li>
          </ul>
          <button className="btn btn-accent" onClick={() => nav('jobs')}>Find Jobs Today</button>
        </div>
        <div className="about-visual">
          <div className="about-card-stack">
            {['🏙️ Lagos', '🏛️ Abuja', '🌍 Nigeria-wide'].map(c => <div key={c} className="about-card">{c}</div>)}
          </div>
          <div className="about-big-stat"><span>10,000+</span><p>Job Seekers Served</p></div>
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    { text: "I found my current job as a personal driver through Jobs Brekete within 3 days of the listing going up. The process was smooth and straightforward!", cite: "Chukwuemeka O., Personal Driver, Lekki" },
    { text: "As a recruiter, I post all my housekeeping vacancies here. I always get good responses fast. It's my go-to platform for domestic staff listings in Lagos.", cite: "Amaka T., Recruiter, Magodo" },
    { text: "Jobs Brekete helped me land a baker role in Ikate. The salary details were transparent and the employer was legitimate. Very professional platform.", cite: "Ibrahim S., Baker, Ikate" },
  ];
  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header"><h2>Success <span className="accent">Stories</span></h2><p>Real people, real results.</p></div>
        <div className="testimonials-grid">
          {quotes.map((q, i) => (
            <blockquote key={i} className="testimonial-card">
              <p>"{q.text}"</p>
              <footer><cite>— {q.cite}</cite></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────
function Contact({ onShowToast }) {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [loading, setLoading] = useState(false);
  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      onShowToast('Please fill in all fields with a valid email.', 'danger'); return;
    }
    setLoading(true);
    setTimeout(() => { setForm({ name:'', email:'', message:'' }); setLoading(false); onShowToast('✅ Message sent! We\'ll get back to you within 24 hours.', 'success'); }, 1000);
  };
  return (
    <section className="contact-section" id="contact">
      <div className="container contact-inner">
        <div className="contact-info">
          <h2>Get In <span className="accent">Touch</span></h2>
          <p>Have a question, partnership inquiry, or need help posting a vacancy?</p>
          <div className="contact-details">
            <div className="contact-item"><span className="contact-icon">📧</span><a href="mailto:hello@jobsbrekete.com">hello@jobsbrekete.com</a></div>
            <div className="contact-item"><span className="contact-icon">📘</span><a href="https://www.facebook.com/groups/jobsbrekete" target="_blank" rel="noopener noreferrer">Facebook Group – Jobs Brekete</a></div>
            <div className="contact-item"><span className="contact-icon">📸</span><a href="https://www.instagram.com/jobs_brekete" target="_blank" rel="noopener noreferrer">Instagram – @jobs_brekete</a></div>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit} noValidate>
          <div className="form-group"><label>Your Name <span className="required">*</span></label><input type="text" value={form.name} onChange={upd('name')} placeholder="Full name" /></div>
          <div className="form-group"><label>Email Address <span className="required">*</span></label><input type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com" /></div>
          <div className="form-group"><label>Message <span className="required">*</span></label><textarea rows={5} value={form.message} onChange={upd('message')} placeholder="How can we help you?" /></div>
          <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>{loading ? 'Sending…' : 'Send Message'}</button>
        </form>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────
function Footer() {
  const nav = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="logo"><span className="logo-icon">JB</span><span className="logo-text">Jobs<span className="accent">Brekete</span></span></div>
          <p>Nigeria's trusted daily job listing platform. Connecting talent with opportunity across Lagos and beyond.</p>
          <div className="social-links">
            <a href="https://www.facebook.com/groups/jobsbrekete" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
            <a href="https://www.instagram.com/jobs_brekete" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📸</a>
          </div>
        </div>
        <nav className="footer-nav">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>{[['home','Home'],['jobs','Browse Jobs'],['post-job','Post a Vacancy'],['about','About Us'],['contact','Contact']].map(([id,l]) => <li key={id}><a onClick={() => nav(id)} href={`#${id}`}>{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Job Categories</h4>
            <ul>{['Hospitality & Catering','Domestic Services','Driving & Logistics','Security','Teaching & Tutoring','Admin & Office'].map(c => <li key={c}><a onClick={() => nav('jobs')} href="#jobs">{c}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Top Locations</h4>
            <ul>{['Jobs in Lekki','Jobs in Surulere','Jobs in Magodo','Jobs in Victoria Island','Jobs in Abuja','Jobs in Ogudu'].map(l => <li key={l}><a onClick={() => nav('jobs')} href="#jobs">{l}</a></li>)}</ul>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Jobs Brekete. All rights reserved. | <a href="#home">Privacy Policy</a> | <a href="#home">Terms of Use</a></p>
      </div>
    </footer>
  );
}

// ============================================================
// ADMIN PANEL COMPONENTS
// ============================================================

const ADMIN_DEFAULTS = { user: 'admin', pass: 'brekete2025!' };
const SESSION_TTL = 8 * 60 * 60 * 1000;

function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SK.session));
    if (!s || Date.now() > s.expires) { localStorage.removeItem(SK.session); return null; }
    return s;
  } catch { return null; }
}
function setSession(u) { localStorage.setItem(SK.session, JSON.stringify({ username: u, expires: Date.now() + SESSION_TTL })); }
function clearSession() { localStorage.removeItem(SK.session); }
function getCreds() { return { user: localStorage.getItem(SK.adminUser) || ADMIN_DEFAULTS.user, pass: localStorage.getItem(SK.adminPass) || ADMIN_DEFAULTS.pass }; }

// ── ADMIN LOGIN ───────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError(false); setLoading(true);
    setTimeout(() => {
      const creds = getCreds();
      if (user === creds.user && pass === creds.pass) { setSession(user); onLogin(user); }
      else { setError(true); setPass(''); setLoading(false); }
    }, 600);
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo"><div className="logo-icon">JB</div><span className="logo-text">Jobs<span className="accent">Brekete</span></span></div>
        <h1>Admin Login</h1>
        <p className="login-sub">This area is restricted to authorised administrators only.</p>
        <form onSubmit={submit}>
          <div className="form-group"><label>Username</label><input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Enter username" autoComplete="username" /></div>
          <div className="form-group"><label>Password</label>
            <div className="pass-wrap">
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}>{showPass ? '🙈' : '👁'}</button>
            </div>
          </div>
          {error && <div className="login-error">❌ Invalid username or password. Please try again.</div>}
          <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Logging in…' : 'Login to Dashboard'}</button>
        </form>
        <p className="login-footer">Forgot credentials? Contact <a href="mailto:hello@jobsbrekete.com">hello@jobsbrekete.com</a></p>
      </div>
    </div>
  );
}

// ── ADMIN SIDEBAR ─────────────────────────────────────────────
function AdminSidebar({ panel, setPanel, sideOpen, setSideOpen, onLogout, counts }) {
  const links = [
    ['overview','📊','Overview'],
    ['manage-jobs','✏️','Manage Jobs'],
    ['submissions','📋','Submissions'],
    ['employers','🏢','Employers'],
    ['subscribers','🔔','Subscribers'],
    ['settings','⚙️','Settings'],
  ];
  return (
    <aside className={`sidebar${sideOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">JB</div>
        <div><div className="sidebar-title">Jobs<span className="accent">Brekete</span></div><div className="sidebar-subtitle">Admin Panel</div></div>
      </div>
      <nav className="sidebar-nav">
        {links.map(([id, icon, label]) => (
          <button key={id} className={`sidebar-link${panel === id ? ' active' : ''}`} onClick={() => { setPanel(id); setSideOpen(false); }}>
            <span className="nav-icon">{icon}</span> {label}
            {counts[id] > 0 && <span className={`badge${id === 'manage-jobs' ? ' green' : ''}`}>{counts[id]}</span>}
          </button>
        ))}
      </nav>
      <button className="btn-logout" onClick={onLogout}>🚪 Logout</button>
    </aside>
  );
}

// ── ADMIN TOPBAR ──────────────────────────────────────────────
function AdminTopbar({ panel, sideOpen, setSideOpen, adminName }) {
  const [time, setTime] = useState('');
  const labels = { overview:'Overview', 'manage-jobs':'Manage Job Listings', submissions:'Job Submissions', employers:'Employer Contacts', subscribers:'Alert Subscribers', settings:'Settings' };
  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    t(); const id = setInterval(t, 1000); return () => clearInterval(id);
  }, []);
  return (
    <header className="topbar">
      <button className="hamburger-admin" onClick={() => setSideOpen(o => !o)}>☰</button>
      <div className="topbar-left"><h2>{labels[panel] || panel}</h2></div>
      <div className="topbar-right">
        <div className="admin-info"><span className="admin-avatar">A</span><span className="admin-name">{adminName}</span></div>
        <div className="topbar-time">{time}</div>
      </div>
    </header>
  );
}

// ── ADMIN OVERVIEW ────────────────────────────────────────────
function AdminOverview({ jobs, submissions, employers, subscribers, setPanel }) {
  const pending = submissions.filter(s => s.status === 'pending').length;
  const stats = [
    { icon:'✏️', color:'green', num: jobs.length, label:'Live Job Listings' },
    { icon:'📋', color:'orange', num: pending, label:'Pending Submissions' },
    { icon:'🏢', color:'blue', num: employers.length, label:'Employer Contacts' },
    { icon:'🔔', color:'purple', num: subscribers.length, label:'Alert Subscribers' },
  ];
  return (
    <section className="panel">
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-card-info"><span className="stat-card-num">{s.num}</span><span className="stat-card-label">{s.label}</span></div>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <div className="panel-card">
          <div className="panel-card-header"><h3>Live Job Listings</h3><button className="btn-small" onClick={() => setPanel('manage-jobs')}>Manage All</button></div>
          <div className="mini-list">{jobs.length === 0 ? <p className="mini-empty">No jobs yet.</p> : jobs.slice(-5).reverse().map(j => <div key={j.id} className="mini-item"><span className="mini-item-title">{j.title}</span><span className="mini-item-sub">{j.location}</span></div>)}</div>
        </div>
        <div className="panel-card">
          <div className="panel-card-header"><h3>Recent Submissions</h3><button className="btn-small" onClick={() => setPanel('submissions')}>View All</button></div>
          <div className="mini-list">{submissions.length === 0 ? <p className="mini-empty">No submissions yet.</p> : submissions.slice(-5).reverse().map(s => <div key={s.id} className="mini-item"><span className="mini-item-title">{s.jobTitle}</span><span className={`status-badge status-${s.status}`}>{s.status}</span></div>)}</div>
        </div>
      </div>
    </section>
  );
}

// ── MANAGE JOBS PANEL (FULL CRUD) ─────────────────────────────
function ManageJobsPanel({ jobs, setJobs, showToast }) {
  const [search, setSearch] = useState('');
  const [editJob, setEditJob] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()));

  const saveJob = (job) => {
    let updated;
    if (job.id && jobs.find(j => j.id === job.id)) {
      updated = jobs.map(j => j.id === job.id ? job : j);
      showToast('✅ Job updated successfully!', 'success');
    } else {
      const newJob = { ...job, id: genId(), date: new Date().toISOString().split('T')[0] };
      updated = [newJob, ...jobs];
      showToast('✅ New job added and published!', 'success');
    }
    setJobs(updated);
    store.set(SK.jobs, updated);
    setEditJob(null); setShowForm(false);
  };

  const deleteJob = (id) => {
    if (!confirm('Delete this job listing? This cannot be undone.')) return;
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated); store.set(SK.jobs, updated);
    showToast('🗑 Job listing deleted.', 'danger');
  };

  const toggleFeatured = (id) => {
    const updated = jobs.map(j => j.id === id ? { ...j, featured: !j.featured } : j);
    setJobs(updated); store.set(SK.jobs, updated);
    showToast('⭐ Featured status updated.', 'info');
  };

  return (
    <section className="panel">
      <div className="panel-toolbar">
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search jobs..." />
        <button className="btn-add-job" onClick={() => { setEditJob(null); setShowForm(true); }}>+ Add New Job</button>
        <button className="btn-export" onClick={() => exportCSV(jobs, 'live_jobs.csv')}>⬇ Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Job Title</th><th>Company</th><th>Location</th><th>Type</th><th>Salary</th><th>Featured</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={9}><div className="empty-state">No jobs found. Click "+ Add New Job" to create one.</div></td></tr>
              : filtered.map((j, i) => (
                <tr key={j.id}>
                  <td className="cell-muted">{i + 1}</td>
                  <td className="cell-bold">{j.title}</td>
                  <td>{j.company}</td>
                  <td className="cell-muted">{j.location}</td>
                  <td><span className={`job-tag-sm ${j.typeClass || ''}`}>{j.type}</span></td>
                  <td className="cell-muted">{j.salary || '—'}</td>
                  <td><button className={`feat-btn${j.featured ? ' active' : ''}`} onClick={() => toggleFeatured(j.id)} title="Toggle Featured">{j.featured ? '⭐' : '☆'}</button></td>
                  <td className="cell-muted">{fmtDate(j.date)}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn view" onClick={() => { setEditJob(j); setShowForm(true); }}>✏️ Edit</button>
                      <button className="action-btn delete" onClick={() => deleteJob(j.id)}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {showForm && <JobFormModal job={editJob} onSave={saveJob} onClose={() => { setShowForm(false); setEditJob(null); }} />}
    </section>
  );
}

// ── JOB FORM MODAL (Add / Edit) ───────────────────────────────
function JobFormModal({ job, onSave, onClose }) {
  const blank = { id:'', title:'', company:'', location:'', type:'Full-Time', typeClass:'full-time', category:'hospitality', salary:'', description:'', contact:'', date:'', featured:false };
  const [form, setForm] = useState(job ? { ...blank, ...job } : blank);
  const [errors, setErrors] = useState({});
  const upd = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => {
      const updated = { ...f, [k]: val };
      if (k === 'type') updated.typeClass = typeClass(val);
      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title is required.';
    if (!form.company.trim()) e.company = 'Company name is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.type) e.type = 'Job type is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.contact.trim()) e.contact = 'Contact details are required.';
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ ...form });
  };

  const fi = (k) => ({ value: form[k] || '', onChange: upd(k) });

  return (
    <Modal onClose={onClose}>
      <button className="modal-close-btn" onClick={onClose}>✕</button>
      <h2 className="modal-title" style={{ marginBottom:'24px' }}>{job ? '✏️ Edit Job Listing' : '➕ Add New Job Listing'}</h2>
      <form onSubmit={submit} noValidate className="job-edit-form">
        <div className="form-row">
          <FormField label="Job Title" required error={errors.title}><input type="text" placeholder="e.g. Personal Driver" {...fi('title')} /></FormField>
          <FormField label="Company / Recruiter" required error={errors.company}><input type="text" placeholder="e.g. Swift Logistics" {...fi('company')} /></FormField>
        </div>
        <div className="form-row">
          <FormField label="Location" required error={errors.location}><input type="text" placeholder="e.g. Lekki Phase 1, Lagos" {...fi('location')} /></FormField>
          <FormField label="Job Type" required error={errors.type}>
            <select {...fi('type')}>
              {['Full-Time','Part-Time','Contract','Live-In'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
        </div>
        <div className="form-row">
          <FormField label="Category">
            <select {...fi('category')}>
              {[['hospitality','Hospitality'],['domestic','Domestic/Household'],['driving','Driving'],['security','Security'],['teaching','Teaching'],['admin','Admin/Office'],['trade','Trade/Skilled']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Salary / Pay Range"><input type="text" placeholder="e.g. ₦80,000 – ₦120,000/month" {...fi('salary')} /></FormField>
        </div>
        <FormField label="Job Description" required error={errors.description}><textarea rows={4} placeholder="Describe the role, responsibilities, requirements..." {...fi('description')} /></FormField>
        <FormField label="Contact (Email or Phone)" required error={errors.contact}><input type="text" placeholder="e.g. 08012345678 or recruiter@example.com" {...fi('contact')} /></FormField>
        <div className="form-row" style={{ alignItems:'center' }}>
          <FormField label="Post Date"><input type="date" {...fi('date')} /></FormField>
          <div className="form-group featured-toggle">
            <label className="checkbox-label">
              <input type="checkbox" checked={!!form.featured} onChange={upd('featured')} />
              <span>⭐ Mark as Featured</span>
            </label>
          </div>
        </div>
        <div className="form-submit-row">
          <button type="submit" className="btn btn-accent btn-lg">{job ? 'Save Changes' : 'Publish Job'}</button>
          <button type="button" className="btn btn-outline btn-lg" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── SUBMISSIONS PANEL ─────────────────────────────────────────
function SubmissionsPanel({ submissions, setSubmissions, jobs, setJobs, showToast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState(null);

  const filtered = submissions.filter(s =>
    (filter === 'all' || s.status === filter) &&
    (!search || [s.jobTitle, s.companyName, s.email].some(f => (f||'').toLowerCase().includes(search.toLowerCase())))
  );

  const approve = (id) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status:'approved', approvedAt: new Date().toISOString() } : s);
    setSubmissions(updated); store.set(SK.submissions, updated);
    const sub = submissions.find(s => s.id === id);
    if (sub && !jobs.find(j => j.id === id)) {
      const newJob = { id, title: sub.jobTitle, company: sub.companyName, location: sub.location, type: sub.jobType, typeClass: typeClass(sub.jobType), category:'admin', salary: sub.salary, description: sub.description, contact: sub.email, date: new Date().toISOString().split('T')[0], featured: false, publishedAt: new Date().toISOString() };
      const updatedJobs = [newJob, ...jobs];
      setJobs(updatedJobs); store.set(SK.jobs, updatedJobs);
    }
    setViewing(null); showToast('✅ Job approved and published!', 'success');
  };

  const reject = (id) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status:'rejected', rejectedAt: new Date().toISOString() } : s);
    setSubmissions(updated); store.set(SK.submissions, updated);
    const updatedJobs = jobs.filter(j => j.id !== id);
    setJobs(updatedJobs); store.set(SK.jobs, updatedJobs);
    setViewing(null); showToast('❌ Submission rejected.', 'warning');
  };

  const del = (id) => {
    if (!confirm('Delete this submission permanently?')) return;
    setSubmissions(submissions.filter(s => s.id !== id));
    store.set(SK.submissions, submissions.filter(s => s.id !== id));
    setViewing(null); showToast('🗑 Submission deleted.', 'danger');
  };

  return (
    <section className="panel">
      <div className="panel-toolbar">
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search submissions..." />
        <select className="filter-select-admin" value={filter} onChange={e => setFilter(e.target.value)}>
          {['all','pending','approved','rejected'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
        </select>
        <button className="btn-export" onClick={() => exportCSV(submissions, 'submissions.csv')}>⬇ Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Job Title</th><th>Company</th><th>Location</th><th>Email</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8}><div className="empty-state">📭 No submissions found.</div></td></tr>
              : [...filtered].reverse().map((s, i) => (
                <tr key={s.id}>
                  <td className="cell-muted">{i+1}</td>
                  <td className="cell-bold">{s.jobTitle}</td>
                  <td>{s.companyName}</td>
                  <td className="cell-muted">{s.location}</td>
                  <td className="cell-email"><a href={`mailto:${s.email}`}>{s.email}</a></td>
                  <td className="cell-muted">{fmtDateTime(s.submittedAt)}</td>
                  <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn view" onClick={() => setViewing(s)}>👁 View</button>
                      {s.status !== 'approved' && <button className="action-btn approve" onClick={() => approve(s.id)}>✅</button>}
                      {s.status !== 'rejected' && <button className="action-btn reject" onClick={() => reject(s.id)}>❌</button>}
                      <button className="action-btn delete" onClick={() => del(s.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <button className="modal-close-btn" onClick={() => setViewing(null)}>✕</button>
          <span className={`status-badge status-${viewing.status}`}>{viewing.status}</span>
          <h2 className="modal-title">{viewing.jobTitle}</h2>
          <p style={{ color:'var(--muted)', fontWeight:600, marginBottom:12 }}>🏢 {viewing.companyName}</p>
          <div className="modal-meta">
            <span>📍 {viewing.location}</span><span>💼 {viewing.jobType}</span>
            <span>💰 {viewing.salary || 'Not specified'}</span><span>📅 {fmtDateTime(viewing.submittedAt)}</span>
          </div>
          <div className="modal-desc"><h4>Job Description</h4><p>{viewing.description}</p></div>
          <div className="modal-desc" style={{ marginTop:14 }}>
            <h4>Contact Details</h4>
            <p>📧 <a href={`mailto:${viewing.email}`}>{viewing.email}</a></p>
            {viewing.phone && <p>📞 {viewing.phone}</p>}
            {viewing.expiryDate && <p>⏰ Expires: {viewing.expiryDate}</p>}
          </div>
          <div className="modal-actions" style={{ marginTop:20 }}>
            {viewing.status !== 'approved' && <button className="action-btn approve" style={{ padding:'10px 20px' }} onClick={() => approve(viewing.id)}>✅ Approve & Publish</button>}
            {viewing.status !== 'rejected' && <button className="action-btn reject" style={{ padding:'10px 20px' }} onClick={() => reject(viewing.id)}>❌ Reject</button>}
            <a className="action-btn email" style={{ padding:'10px 20px' }} href={`mailto:${viewing.email}`}>📧 Email Employer</a>
            <button className="action-btn delete" style={{ padding:'10px 20px' }} onClick={() => del(viewing.id)}>🗑 Delete</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ── EMPLOYERS PANEL ───────────────────────────────────────────
function EmployersPanel({ employers, setEmployers, submissions, showToast }) {
  const [search, setSearch] = useState('');
  const filtered = employers.filter(e => !search || [e.companyName, e.email].some(f => (f||'').toLowerCase().includes(search.toLowerCase())));

  const del = (email) => {
    if (!confirm(`Remove employer contact: ${email}?`)) return;
    const updated = employers.filter(e => e.email !== email);
    setEmployers(updated); store.set(SK.employers, updated);
    showToast('🗑 Employer contact removed.', 'danger');
  };

  return (
    <section className="panel">
      <div className="panel-toolbar">
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search employer contacts..." />
        <button className="btn-export" onClick={() => exportCSV(employers, 'employer_contacts.csv')}>⬇ Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Company / Recruiter</th><th>Contact Email</th><th>Phone</th><th>Jobs Posted</th><th>Last Submission</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7}><div className="empty-state">📭 No employer contacts yet. They appear when employers post vacancies.</div></td></tr>
              : [...filtered].reverse().map((emp, i) => {
                const posted = submissions.filter(s => s.email === emp.email).length;
                return (
                  <tr key={emp.email}>
                    <td className="cell-muted">{i+1}</td>
                    <td className="cell-bold">{emp.companyName}</td>
                    <td className="cell-email"><a href={`mailto:${emp.email}`}>{emp.email}</a></td>
                    <td className="cell-muted">{emp.phone || '—'}</td>
                    <td><span className="badge">{posted}</span></td>
                    <td className="cell-muted">{fmtDateTime(emp.lastSubmission)}</td>
                    <td>
                      <div className="actions-cell">
                        <a className="action-btn email" href={`mailto:${emp.email}`}>📧 Email</a>
                        <button className="action-btn delete" onClick={() => del(emp.email)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── SUBSCRIBERS PANEL ──────────────────────────────────────────
function SubscribersPanel({ subscribers, setSubscribers, showToast }) {
  const [search, setSearch] = useState('');
  const filtered = subscribers.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()));
  const del = (email) => {
    if (!confirm(`Remove subscriber: ${email}?`)) return;
    const updated = subscribers.filter(s => s.email !== email);
    setSubscribers(updated); store.set(SK.subscribers, updated);
    showToast('🗑 Subscriber removed.', 'danger');
  };
  return (
    <section className="panel">
      <div className="panel-toolbar">
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search subscribers..." />
        <button className="btn-export" onClick={() => exportCSV(subscribers, 'subscribers.csv')}>⬇ Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Email Address</th><th>Subscribed On</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={4}><div className="empty-state">📭 No subscribers yet.</div></td></tr>
              : [...filtered].reverse().map((s, i) => (
                <tr key={s.email}>
                  <td className="cell-muted">{i+1}</td>
                  <td className="cell-email"><a href={`mailto:${s.email}`}>{s.email}</a></td>
                  <td className="cell-muted">{fmtDateTime(s.subscribedAt)}</td>
                  <td><div className="actions-cell"><a className="action-btn email" href={`mailto:${s.email}`}>📧</a><button className="action-btn delete" onClick={() => del(s.email)}>🗑</button></div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── SETTINGS PANEL ────────────────────────────────────────────
function SettingsPanel({ onLogout, showToast, setJobs }) {
  const [curr, setCurr] = useState('');
  const [newP, setNewP] = useState('');
  const [conf, setConf] = useState('');
  const [note, setNote] = useState(null);

  const changePass = (e) => {
    e.preventDefault();
    const creds = getCreds();
    if (curr !== creds.pass) { setNote({ msg:'❌ Current password is incorrect.', type:'danger' }); return; }
    if (newP.length < 8) { setNote({ msg:'❌ New password must be at least 8 characters.', type:'danger' }); return; }
    if (newP !== conf) { setNote({ msg:'❌ Passwords do not match.', type:'danger' }); return; }
    localStorage.setItem(SK.adminPass, newP);
    setCurr(''); setNewP(''); setConf('');
    setNote({ msg:'✅ Password updated successfully!', type:'success' });
    setTimeout(() => setNote(null), 4000);
  };

  const clearAll = () => {
    if (!confirm('Permanently delete ALL data (submissions, employers, subscribers)? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure?')) return;
    [SK.submissions, SK.employers, SK.subscribers].forEach(k => localStorage.removeItem(k));
    showToast('🗑 All data cleared.', 'danger');
  };

  const resetJobs = () => {
    if (!confirm('Reset job listings to default sample data? This will remove any jobs you added.')) return;
    store.set(SK.jobs, DEFAULT_JOBS);
    setJobs(DEFAULT_JOBS);
    showToast('🔄 Job listings reset to defaults.', 'info');
  };

  return (
    <section className="panel">
      <div className="settings-grid">
        <div className="panel-card">
          <h3>Change Admin Password</h3>
          <form onSubmit={changePass} style={{ marginTop:16 }}>
            <div className="form-group"><label>Current Password</label><input type="password" value={curr} onChange={e => setCurr(e.target.value)} placeholder="Current password" /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={newP} onChange={e => setNewP(e.target.value)} placeholder="Min 8 characters" /></div>
            <div className="form-group"><label>Confirm New Password</label><input type="password" value={conf} onChange={e => setConf(e.target.value)} placeholder="Repeat new password" /></div>
            {note && <p className={`settings-note ${note.type}`}>{note.msg}</p>}
            <button type="submit" className="btn-save">Update Password</button>
          </form>
        </div>
        <div className="panel-card">
          <h3>Admin Info</h3>
          <div className="cred-info" style={{ marginTop:16 }}>
            <p>🔐 <strong>Admin URL:</strong> <code>yoursite.com?admin=true</code></p>
            <p>👤 <strong>Default Username:</strong> <code>admin</code></p>
            <p>🔑 <strong>Default Password:</strong> <code>brekete2025!</code></p>
            <p className="warn">⚠️ Change credentials immediately after first login.</p>
          </div>
          <hr style={{ margin:'20px 0', borderColor:'var(--mid)' }} />
          <h3>Data Management</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:12 }}>
            <button className="btn-danger" onClick={resetJobs}>🔄 Reset Jobs to Defaults</button>
            <button className="btn-danger" onClick={clearAll}>🗑 Clear All Submission Data</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────
function AdminDashboard() {
  const sess = getSession();
  const [adminName, setAdminName] = useState(sess?.username || '');
  const [loggedIn, setLoggedIn] = useState(!!sess);
  const [panel, setPanel] = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);

  const [jobs, setJobs] = useState(() => store.get(SK.jobs, DEFAULT_JOBS));
  const [submissions, setSubmissions] = useState(() => store.get(SK.submissions, []));
  const [employers, setEmployers] = useState(() => store.get(SK.employers, []));
  const [subscribers, setSubscribers] = useState(() => store.get(SK.subscribers, []));
  const [toast, showToast] = useToast();

  const logout = () => { clearSession(); setLoggedIn(false); };

  const counts = {
    overview: 0,
    'manage-jobs': jobs.length,
    submissions: submissions.filter(s => s.status === 'pending').length,
    employers: employers.length,
    subscribers: subscribers.length,
    settings: 0,
  };

  if (!loggedIn) return <AdminLogin onLogin={(u) => { setAdminName(u); setLoggedIn(true); }} />;

  const panels = {
    overview: <AdminOverview jobs={jobs} submissions={submissions} employers={employers} subscribers={subscribers} setPanel={setPanel} />,
    'manage-jobs': <ManageJobsPanel jobs={jobs} setJobs={setJobs} showToast={showToast} />,
    submissions: <SubmissionsPanel submissions={submissions} setSubmissions={setSubmissions} jobs={jobs} setJobs={setJobs} showToast={showToast} />,
    employers: <EmployersPanel employers={employers} setEmployers={setEmployers} submissions={submissions} showToast={showToast} />,
    subscribers: <SubscribersPanel subscribers={subscribers} setSubscribers={setSubscribers} showToast={showToast} />,
    settings: <SettingsPanel onLogout={logout} showToast={showToast} setJobs={setJobs} />,
  };

  return (
    <div id="admin-dashboard">
      <AdminSidebar panel={panel} setPanel={setPanel} sideOpen={sideOpen} setSideOpen={setSideOpen} onLogout={logout} counts={counts} />
      <div className="main-content">
        <AdminTopbar panel={panel} sideOpen={sideOpen} setSideOpen={setSideOpen} adminName={adminName} />
        {panels[panel]}
      </div>
      <Toast toast={toast} />
    </div>
  );
}

// ── CSV EXPORT ────────────────────────────────────────────────
function exportCSV(data, filename) {
  if (!data.length) { alert('No data to export.'); return; }
  const headers = Object.keys(data[0]);
  const rows = [headers.join(','), ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// ROOT APP — Routes between Public Site and Admin
// ============================================================
function App() {
  // Seed default jobs on first load
  useEffect(() => { seedJobs(); }, []);

  // Routing: ?admin=true or #admin → admin panel
  const isAdmin = window.location.search.includes('admin=true') || window.location.hash === '#admin';
  const [toast, showToast] = useToast();

  // Public site reads from localStorage (updated by admin)
  const [publicJobs, setPublicJobs] = useState(() => store.get(SK.jobs, DEFAULT_JOBS));

  // Refresh public jobs when localStorage changes (cross-tab sync)
  useEffect(() => {
    if (isAdmin) return;
    const h = () => setPublicJobs(store.get(SK.jobs, DEFAULT_JOBS));
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [isAdmin]);

  if (isAdmin) {
    // No SEO indexing for admin
    document.title = 'Admin Dashboard – Jobs Brekete';
    const existingRobots = document.querySelector('meta[name="robots"]');
    if (existingRobots) existingRobots.content = 'noindex, nofollow';
    return <AdminDashboard />;
  }

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <IntroStrip />
        <JobsSection jobs={publicJobs} />
        <PostJobSection onShowToast={showToast} />
        <HowItWorks />
        <About />
        <Testimonials />
        <Contact onShowToast={showToast} />
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
}

// ── MOUNT ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);