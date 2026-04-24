import type { PortfolioNode } from '@/data/nodes'

// Each entry maps one or more keyword fragments → node ids to surface
const KEYWORD_MAP: Array<[string[], string[]]> = [
  [['real-time', 'realtime', 'live'],           ['socketio', 'sse', 'realtime', 'kafka']],
  [['distributed', 'scale', 'scaling'],         ['dist', 'microservice', 'kafka', 'redis', 'k8s']],
  [['machine learning', ' ml ', 'llm'],         ['langchain', 'rag', 'gemini', 'vectordb', 'nlp']],
  [[' ai ', 'artificial intelligence'],         ['langchain', 'rag', 'gemini', 'vectordb', 'nlp']],
  [['backend', 'server side', ' api '],         ['nodejs', 'spring', 'restapi', 'postgres', 'redis']],
  [['frontend', ' ui ', 'interface'],           ['react', 'redux', 'angular', 'socketio']],
  [['auth', 'security', 'login', 'jwt'],        ['oauth', 'rbac']],
  [['kubernetes', ' k8s ', 'devops', 'infra'],  ['k8s', 'docker', 'cicd', 'prom', 'grafana']],
  [['vector', 'embedding', 'semantic search'],  ['vectordb', 'embed', 'rag']],
  [['kafka', 'event stream', 'streaming', 'queue'], ['kafka', 'eda']],
  [['location', 'geospatial', 'geo', 'maps'],   ['geo', 'gmaps', 'maplibre', 'globegl']],
]

type Role = 'recruiter' | 'engineer' | 'exploring'

const ROLE_FILTER: Record<Role, (r: string) => boolean> = {
  recruiter: r => r.startsWith('recruiter'),
  engineer:  r => r === 'engineer',
  exploring: r => r === 'exploring',
}

/**
 * Maps free-form visitor input to a ranked list of node ids.
 * Falls back to role-relevant nodes when no keywords match.
 */
export function parseIntent(
  input: string,
  nodes: PortfolioNode[],
  role?: Role,
): string[] {
  // Pad with spaces so word-boundary fragments (e.g. ' ai ') match at edges too
  const text = ` ${input.toLowerCase().trim()} `
  const matched = new Set<string>()

  // Direct label match (case-insensitive)
  for (const node of nodes) {
    if (text.includes(node.label.toLowerCase())) matched.add(node.id)
  }

  // Keyword map
  for (const [keywords, ids] of KEYWORD_MAP) {
    if (keywords.some(kw => text.includes(kw))) {
      for (const id of ids) matched.add(id)
    }
  }

  // Role-based fallback when nothing matched
  if (matched.size === 0 && role) {
    const filter = ROLE_FILTER[role]
    nodes
      .filter(n => n.relevantTo?.some(filter))
      .slice(0, 8)
      .forEach(n => matched.add(n.id))
  }

  return [...matched].slice(0, 8)
}
