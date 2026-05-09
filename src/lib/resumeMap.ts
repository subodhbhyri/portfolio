import type { VisitorRole } from './types'

const RESUME_MAP: Record<VisitorRole | 'default', { file: string; label: string }> = {
  'recruiter-ai':             { file: '/resumes/resume-ai-engineering.pdf',     label: 'AI Engineering Resume' },
  'recruiter-backend':        { file: '/resumes/resume-backend-java.pdf',       label: 'Backend / Java Resume' },
  'recruiter-data':           { file: '/resumes/resume-data-engineering.pdf',   label: 'Data Engineering Resume' },
  'recruiter-fullstack':      { file: '/resumes/resume-fullstack-java.pdf',     label: 'Full-Stack Java Resume' },
  'recruiter-frontend':       { file: '/resumes/resume-frontend.pdf',           label: 'Frontend Resume' },
  'recruiter-automation':     { file: '/resumes/resume-testing-automation.pdf', label: 'Testing & Automation Resume' },
  'recruiter-infrastructure': { file: '/resumes/resume-storage-infra.pdf',      label: 'Storage / Infra Resume' },
  'engineer':                 { file: '/resumes/resume-general-sde.pdf',        label: 'Resume' },
  'exploring':                { file: '/resumes/resume-general-sde.pdf',        label: 'Resume' },
  'default':                  { file: '/resumes/resume-general-sde.pdf',        label: 'Resume' },
}

export function getResume(role: VisitorRole | null): { file: string; label: string } {
  return RESUME_MAP[role ?? 'default']
}
