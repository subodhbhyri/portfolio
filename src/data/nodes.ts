export type Cluster = 'backend' | 'ai' | 'frontend' | 'concept' | 'project';

export type NodeSize = 'lg' | 'md' | 'sm'; // lg = project anchor, md = primary tech, sm = supporting

export interface PortfolioEdge {
  source: string; // node id
  target: string; // node id
  weight?: number; // 1–3, controls edge opacity; defaults to 1
}

export interface ProcessStep {
  title: string;
  detail: string; // 1–2 sentences on what you built / decided
}

export interface PortfolioNode {
  id: string;
  label: string;
  cluster: Cluster;
  size: NodeSize;

  // shown in hover tooltip and node detail panel
  description: string;

  // shown in expanded NodeDetail panel (optional for non-project nodes)
  detail?: {
    summary?: string;           // 2–3 sentence overview
    highlights?: string[];      // bullet points — key technical decisions
    process?: ProcessStep[];    // for project nodes: how you built it
    stack?: string[];           // tech ids used in this project
    links?: {
      github?: string;
      live?: string;
      demo?: string;
    };
    metrics?: {                 // impressive numbers, shown as stat cards
      label: string;
      value: string;
    }[];
  };

  // visitor targeting — which visitor roles find this node most relevant
  // used by AdaptationEngine to re-weight and reorder
  relevantTo?: ('recruiter-backend' | 'recruiter-ai' | 'recruiter-fullstack' | 'engineer' | 'exploring')[];
}

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const nodes: PortfolioNode[] = [

  // ── Projects ──────────────────────────────────────────────────────────────

  {
    id: 'slotify',
    label: 'Slotify',
    cluster: 'project',
    size: 'lg',
    description: 'Distributed ticket reservation system — Java 21, Kafka, Redis, K8s',
    relevantTo: ['recruiter-backend', 'engineer'],
    detail: {
      summary: 'Event-driven microservices platform handling high-concurrency ticket booking with sub-50ms p99 latency. Built to survive thundering-herd scenarios using Redis distributed locking and priority waitlists.',
      highlights: [
        'Priority-based waitlist via Redis sorted sets with automatic seat reassignment on cancellation',
        'Optimistic concurrency control prevents double-booking under load',
        'Full observability stack: Prometheus metrics, Grafana dashboards, OpenTelemetry traces',
        '99.9% uptime validated through k6 load testing on Kubernetes',
      ],
      process: [
        { title: 'Problem', detail: 'Concurrent booking requests cause race conditions — two users book the same seat simultaneously.' },
        { title: 'Design', detail: 'Chose Redis distributed locks over DB-level locks for speed. Kafka decouples booking confirmation from seat allocation.' },
        { title: 'Hardest part', detail: 'Getting waitlist promotion right — when a seat is released, the highest-priority waiter must be notified and given a bounded window to confirm.' },
        { title: 'What I\'d change', detail: 'Replace gRPC inter-service calls with async Kafka events for better resilience during partial failures.' },
      ],
      stack: ['kafka', 'redis', 'postgres', 'k8s', 'docker', 'grpc', 'spring', 'prom', 'grafana'],
      links: { github: 'https://github.com/subodhbhyri/slotify' },
      metrics: [
        { label: 'p99 booking latency', value: '<50ms' },
        { label: 'Uptime', value: '99.9%' },
      ],
    },
  },

  {
    id: 'comrades',
    label: 'Comrades',
    cluster: 'project',
    size: 'lg',
    description: 'Vicinity-based social platform — LangChain, Gemini, Socket.io, MongoDB',
    relevantTo: ['recruiter-ai', 'recruiter-fullstack', 'engineer'],
    detail: {
      summary: 'Location-aware social platform where an AI agent classifies post intent, queries nearby users, and dispatches real-time notifications — all with sub-second latency.',
      highlights: [
        'MongoDB $geoNear queries for hyper-local post discovery across 1000+ simulated sessions',
        'LangChain agent achieves 95%+ classification accuracy for post intent detection',
        'Personalized feed ranking with NLP-based category prediction reduces user input effort by ~30%',
        'Socket.io powers real-time targeted notifications dispatched by the AI agent',
      ],
      process: [
        { title: 'Problem', detail: 'Generic social feeds don\'t surface what\'s relevant nearby. Users need hyper-local, intent-aware content.' },
        { title: 'Design', detail: 'Combined geospatial indexing with an AI classification layer — location narrows the candidate set, intent ranks it.' },
        { title: 'Hardest part', detail: 'Keeping the LangChain agent deterministic enough to be reliable while flexible enough to handle varied natural language input.' },
        { title: 'What I\'d change', detail: 'Add a feedback loop — let user engagement data retrain the ranking model over time.' },
      ],
      stack: ['langchain', 'gemini', 'socketio', 'nodejs', 'mongodb', 'gmaps', 'nlp', 'geo'],
      links: { live: 'https://comrades.vercel.app/' },
      metrics: [
        { label: 'Classification accuracy', value: '95%+' },
        { label: 'Notification latency', value: '<1s' },
      ],
    },
  },

  {
    id: 'timeline',
    label: 'Timeline',
    cluster: 'project',
    size: 'lg',
    description: 'AI-native history explorer — Gemini, RAG, MongoDB Atlas, MCP Server',
    relevantTo: ['recruiter-ai', 'engineer', 'exploring'],
    detail: {
      summary: 'Web platform that lets users explore history through an AI layer backed by a semantic RAG pipeline. External AI agents can query it via a custom MCP server.',
      highlights: [
        'Semantic RAG pipeline with tiered fallback logic reduces LLM hallucinations by 40%',
        'MCP server enables standardized tool-calling for external AI agents',
        'Server-Sent Events cut Time to First Token by 25ms vs polling',
        'React Globe GL renders historical events as interactive 3D geography',
      ],
      process: [
        { title: 'Problem', detail: 'LLMs hallucinate historical facts. Need a grounded retrieval layer, not pure generation.' },
        { title: 'Design', detail: 'Gemini embeddings index verified historical data in Atlas Vector Search. Queries hit the vector store first, fall back to LLM only when needed.' },
        { title: 'Hardest part', detail: 'Tuning the RAG fallback threshold — too strict and the LLM never activates, too loose and hallucinations creep back.' },
        { title: 'What I\'d change', detail: 'Add a human-in-the-loop verification layer for contested historical claims.' },
      ],
      stack: ['rag', 'vectordb', 'mcp', 'embed', 'gemini', 'mongodb', 'sse', 'globegl', 'maplibre', 'react'],
      links: { live: 'https://timeline-tau-eight.vercel.app' },
      metrics: [
        { label: 'Hallucination reduction', value: '40%' },
        { label: 'TTFT improvement', value: '25ms' },
        { label: 'Connection stability', value: '99.9%' },
      ],
    },
  },

  {
    id: 'vishwanath',
    label: 'Vishwanath',
    cluster: 'project',
    size: 'lg',
    description: 'Enterprise monitoring & RBAC — React, Node.js, OAuth2, REST',
    relevantTo: ['recruiter-backend', 'recruiter-fullstack'],
    detail: {
      summary: 'Centralized admin platform for real-time transmission line monitoring, with a scalable RBAC system managing 500+ users across multi-tier enterprise environments.',
      highlights: [
        'RBAC system supports 500+ users across multi-tier enterprise roles',
        'REST API optimization achieved 60% faster data retrieval, -20ms latency',
        'OAuth2 + JWT integration yielded 99.9% secure token success rate',
      ],
      process: [
        { title: 'Context', detail: 'First production role — building internal tooling for infrastructure monitoring at scale.' },
        { title: 'Key decision', detail: 'Chose a centralized sensor aggregation model over per-device dashboards to reduce incident response time.' },
        { title: 'What I learned', detail: 'Designing RBAC upfront saves enormous refactoring pain — access control affects every layer of the stack.' },
      ],
      stack: ['nodejs', 'react', 'rbac', 'oauth', 'restapi'],
      metrics: [
        { label: 'Data retrieval speed', value: '+60%' },
        { label: 'Latency reduction', value: '20ms' },
        { label: 'Auth success rate', value: '99.9%' },
      ],
    },
  },

  // ── Backend & Infra ────────────────────────────────────────────────────────

  { id: 'kafka',    label: 'Kafka',       cluster: 'backend', size: 'md', description: 'Event streaming backbone for Slotify\'s booking pipeline', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'redis',    label: 'Redis',       cluster: 'backend', size: 'md', description: 'Distributed locking and priority sorted sets in Slotify', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'postgres', label: 'PostgreSQL',  cluster: 'backend', size: 'md', description: 'Relational persistence layer in Slotify', relevantTo: ['recruiter-backend'] },
  { id: 'k8s',      label: 'Kubernetes',  cluster: 'backend', size: 'md', description: 'Container orchestration and CI/CD for Slotify', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'docker',   label: 'Docker',      cluster: 'backend', size: 'sm', description: 'Containerization across all services', relevantTo: ['recruiter-backend'] },
  { id: 'grpc',     label: 'gRPC',        cluster: 'backend', size: 'sm', description: 'Inter-service communication in Slotify', relevantTo: ['engineer'] },
  { id: 'spring',   label: 'Spring Boot', cluster: 'backend', size: 'md', description: 'Java microservices framework — Slotify', relevantTo: ['recruiter-backend'] },
  { id: 'nodejs',   label: 'Node.js',     cluster: 'backend', size: 'md', description: 'Backend runtime — Comrades and Vishwanath', relevantTo: ['recruiter-fullstack', 'recruiter-backend'] },
  { id: 'mongodb',  label: 'MongoDB',     cluster: 'backend', size: 'md', description: 'Document store with geospatial indexing in Comrades; Atlas Vector Search in Timeline', relevantTo: ['recruiter-backend', 'recruiter-ai'] },
  { id: 'prom',     label: 'Prometheus',  cluster: 'backend', size: 'sm', description: 'Metrics collection in Slotify', relevantTo: ['engineer'] },
  { id: 'grafana',  label: 'Grafana',     cluster: 'backend', size: 'sm', description: 'Observability dashboards in Slotify', relevantTo: ['engineer'] },
  { id: 'aws',      label: 'AWS',         cluster: 'backend', size: 'sm', description: 'EC2, S3, RDS — cloud infra', relevantTo: ['recruiter-backend'] },
  { id: 'rbac',     label: 'RBAC',        cluster: 'backend', size: 'sm', description: 'Role-based access control — Vishwanath (500+ users)', relevantTo: ['recruiter-backend'] },
  { id: 'oauth',    label: 'OAuth2/JWT',  cluster: 'backend', size: 'sm', description: '99.9% token success rate — Vishwanath and Comrades', relevantTo: ['recruiter-backend'] },

  // ── AI & ML ────────────────────────────────────────────────────────────────

  { id: 'langchain', label: 'LangChain',  cluster: 'ai', size: 'md', description: 'AI agent framework — powers intent classification in Comrades', relevantTo: ['recruiter-ai', 'engineer'] },
  { id: 'rag',       label: 'RAG',        cluster: 'ai', size: 'md', description: 'Retrieval-augmented generation pipeline — Timeline', relevantTo: ['recruiter-ai', 'engineer'] },
  { id: 'gemini',    label: 'Gemini API', cluster: 'ai', size: 'md', description: 'LLM backbone for both Timeline and Comrades', relevantTo: ['recruiter-ai'] },
  { id: 'vectordb',  label: 'Vector DB',  cluster: 'ai', size: 'md', description: 'MongoDB Atlas Vector Search for semantic retrieval', relevantTo: ['recruiter-ai', 'engineer'] },
  { id: 'mcp',       label: 'MCP',        cluster: 'ai', size: 'sm', description: 'Model Context Protocol server — Timeline exposes tools to external agents', relevantTo: ['recruiter-ai', 'engineer'] },
  { id: 'embed',     label: 'Embeddings', cluster: 'ai', size: 'sm', description: 'Gemini embeddings for semantic search in Timeline', relevantTo: ['recruiter-ai'] },
  { id: 'nlp',       label: 'NLP',        cluster: 'ai', size: 'sm', description: 'Intent classification and feed ranking in Comrades', relevantTo: ['recruiter-ai'] },
  { id: 'openai',    label: 'OpenAI',     cluster: 'ai', size: 'sm', description: 'LLM API experience — GPT-4 integrations', relevantTo: ['recruiter-ai'] },

  // ── Frontend & Real-time ──────────────────────────────────────────────────

  { id: 'react',    label: 'React',       cluster: 'frontend', size: 'md', description: 'Primary UI framework — Timeline and Vishwanath', relevantTo: ['recruiter-fullstack'] },
  { id: 'socketio', label: 'Socket.io',   cluster: 'frontend', size: 'md', description: 'Real-time bidirectional events — Comrades notifications', relevantTo: ['recruiter-fullstack', 'engineer'] },
  { id: 'sse',      label: 'SSE',         cluster: 'frontend', size: 'sm', description: 'Server-Sent Events for streaming AI responses in Timeline', relevantTo: ['recruiter-ai', 'engineer'] },
  { id: 'globegl',  label: 'Globe GL',    cluster: 'frontend', size: 'sm', description: '3D interactive globe — Timeline', relevantTo: ['exploring'] },
  { id: 'maplibre', label: 'MapLibre',    cluster: 'frontend', size: 'sm', description: 'Geospatial map rendering — Timeline', relevantTo: ['exploring'] },
  { id: 'gmaps',    label: 'Google Maps', cluster: 'frontend', size: 'sm', description: 'Geo queries and map display — Comrades', relevantTo: ['recruiter-fullstack'] },
  { id: 'redux',    label: 'Redux',       cluster: 'frontend', size: 'sm', description: 'State management', relevantTo: ['recruiter-fullstack'] },
  { id: 'angular',  label: 'Angular',     cluster: 'frontend', size: 'sm', description: 'Frontend framework experience', relevantTo: ['recruiter-fullstack'] },

  // ── Concepts ───────────────────────────────────────────────────────────────

  { id: 'microservice', label: 'Microservices', cluster: 'concept', size: 'md', description: 'Architecture pattern — Slotify is a full microservices system', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'eda',          label: 'Event-driven',  cluster: 'concept', size: 'md', description: 'EDA architecture via Kafka — decoupled async services', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'concur',       label: 'Concurrency',   cluster: 'concept', size: 'md', description: 'Distributed locking, optimistic concurrency, multithreading', relevantTo: ['engineer'] },
  { id: 'dist',         label: 'Distributed',   cluster: 'concept', size: 'md', description: 'Distributed systems patterns across Slotify and Comrades', relevantTo: ['recruiter-backend', 'engineer'] },
  { id: 'cicd',         label: 'CI/CD',          cluster: 'concept', size: 'sm', description: 'GitHub Actions pipelines — Slotify', relevantTo: ['recruiter-backend'] },
  { id: 'restapi',      label: 'REST APIs',      cluster: 'concept', size: 'sm', description: '60% latency improvement via API optimization — Vishwanath', relevantTo: ['recruiter-backend', 'recruiter-fullstack'] },
  { id: 'geo',          label: 'Geospatial',     cluster: 'concept', size: 'sm', description: '$geoNear MongoDB queries — Comrades location matching', relevantTo: ['engineer'] },
  { id: 'realtime',     label: 'Real-time',      cluster: 'concept', size: 'sm', description: 'Live data patterns across Socket.io, SSE, and Kafka', relevantTo: ['recruiter-fullstack', 'engineer'] },
];

// ─── Edges ────────────────────────────────────────────────────────────────────

export const edges: PortfolioEdge[] = [
  // Slotify
  { source: 'slotify', target: 'kafka',       weight: 3 },
  { source: 'slotify', target: 'redis',       weight: 3 },
  { source: 'slotify', target: 'postgres',    weight: 2 },
  { source: 'slotify', target: 'k8s',         weight: 2 },
  { source: 'slotify', target: 'grpc',        weight: 2 },
  { source: 'slotify', target: 'spring',      weight: 2 },
  { source: 'slotify', target: 'prom',        weight: 1 },
  { source: 'slotify', target: 'grafana',     weight: 1 },
  { source: 'slotify', target: 'microservice',weight: 3 },
  { source: 'slotify', target: 'eda',         weight: 3 },
  { source: 'slotify', target: 'concur',      weight: 3 },
  { source: 'slotify', target: 'dist',        weight: 2 },

  // Comrades
  { source: 'comrades', target: 'langchain',  weight: 3 },
  { source: 'comrades', target: 'gemini',     weight: 2 },
  { source: 'comrades', target: 'socketio',   weight: 3 },
  { source: 'comrades', target: 'nodejs',     weight: 2 },
  { source: 'comrades', target: 'mongodb',    weight: 2 },
  { source: 'comrades', target: 'gmaps',      weight: 2 },
  { source: 'comrades', target: 'nlp',        weight: 2 },
  { source: 'comrades', target: 'geo',        weight: 2 },
  { source: 'comrades', target: 'realtime',   weight: 2 },

  // Timeline
  { source: 'timeline', target: 'rag',        weight: 3 },
  { source: 'timeline', target: 'vectordb',   weight: 3 },
  { source: 'timeline', target: 'mcp',        weight: 2 },
  { source: 'timeline', target: 'embed',      weight: 2 },
  { source: 'timeline', target: 'gemini',     weight: 3 },
  { source: 'timeline', target: 'mongodb',    weight: 2 },
  { source: 'timeline', target: 'sse',        weight: 2 },
  { source: 'timeline', target: 'globegl',    weight: 2 },
  { source: 'timeline', target: 'maplibre',   weight: 1 },
  { source: 'timeline', target: 'react',      weight: 2 },

  // Vishwanath
  { source: 'vishwanath', target: 'nodejs',   weight: 2 },
  { source: 'vishwanath', target: 'rbac',     weight: 3 },
  { source: 'vishwanath', target: 'oauth',    weight: 3 },
  { source: 'vishwanath', target: 'restapi',  weight: 3 },
  { source: 'vishwanath', target: 'react',    weight: 2 },

  // Cross-tech relationships
  { source: 'kafka',    target: 'eda',         weight: 3 },
  { source: 'kafka',    target: 'microservice',weight: 2 },
  { source: 'redis',    target: 'concur',      weight: 3 },
  { source: 'redis',    target: 'dist',        weight: 2 },
  { source: 'rag',      target: 'embed',       weight: 3 },
  { source: 'rag',      target: 'vectordb',    weight: 3 },
  { source: 'rag',      target: 'nlp',         weight: 1 },
  { source: 'langchain',target: 'rag',         weight: 2 },
  { source: 'langchain',target: 'gemini',      weight: 2 },
  { source: 'socketio', target: 'realtime',    weight: 3 },
  { source: 'sse',      target: 'realtime',    weight: 3 },
  { source: 'k8s',      target: 'docker',      weight: 2 },
  { source: 'k8s',      target: 'cicd',        weight: 2 },
  { source: 'k8s',      target: 'microservice',weight: 2 },
  { source: 'spring',   target: 'microservice',weight: 2 },
  { source: 'gmaps',    target: 'geo',         weight: 2 },
  { source: 'maplibre', target: 'geo',         weight: 2 },
  { source: 'oauth',    target: 'rbac',        weight: 2 },
  { source: 'gemini',   target: 'openai',      weight: 1 },
  { source: 'mongodb',  target: 'vectordb',    weight: 2 },
  { source: 'dist',     target: 'microservice',weight: 2 },
  { source: 'nodejs',   target: 'restapi',     weight: 2 },
];