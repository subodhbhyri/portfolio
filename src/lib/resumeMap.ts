import type { VisitorRole } from './types'

const RESUME_MAP: Record<VisitorRole | 'default', { file: string; label: string }> = {
  'recruiter-backend':   { file: '/resumes/resume-java-springboot.pdf',  label: 'Java / Spring Boot Resume' },
  'recruiter-ai':        { file: '/resumes/resume-ai-ml.pdf',            label: 'AI / ML Resume' },
  'recruiter-fullstack': { file: '/resumes/resume-sde-general.pdf',      label: 'SDE Resume' },
  'recruiter-data':      { file: '/resumes/resume-data-engineering.pdf', label: 'Data Engineering Resume' },
  'recruiter-automation':{ file: '/resumes/resume-automation.pdf',       label: 'Automation / QA Resume' },
  'recruiter-frontend':  { file: '/resumes/resume-frontend.pdf',         label: 'Frontend Resume' },
  'engineer':            { file: '/resumes/resume-sde-general.pdf',      label: 'Resume' },
  'exploring':           { file: '/resumes/resume-sde-general.pdf',      label: 'Resume' },
  'default':             { file: '/resumes/resume-sde-general.pdf',      label: 'Resume' },
}

export function getResume(role: VisitorRole | null): { file: string; label: string } {
  return RESUME_MAP[role ?? 'default']
}
