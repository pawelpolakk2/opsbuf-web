import { CodeLanguage } from '../ui/highlight';
import { IconName } from '../ui/icons';

export interface ModuleCard {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  files: string[];
  summary: string;
}

export interface Spotlight extends ModuleCard {
  points: string[];
  sample: CodeSample;
}

export interface Principle {
  icon: IconName;
  title: string;
  text: string;
}

export interface CodeSample {
  file: string;
  language: CodeLanguage;
  code: string;
}

export interface WorkflowStep {
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  sample: CodeSample;
}

export interface SecurityPoint {
  icon: IconName;
  title: string;
  text: string;
}

export interface Question {
  question: string;
  answer: string;
}

export const PRINCIPLES: Principle[] = [
  {
    icon: 'file',
    title: 'Plain files in git',
    text: 'Sources, searches and scripts are small YAML files next to your code. The team gets them with a pull.',
  },
  {
    icon: 'columns',
    title: 'One switch for every environment',
    text: 'Press ⌘1 to ⌘9 and every module follows: logs, clusters, keys and scripts move to DEV, TEST or PROD.',
  },
  {
    icon: 'shield',
    title: 'Safe with production',
    text: 'Read-only environments, a confirmation before writes and an audit of every action.',
  },
];

export const SPOTLIGHTS: Spotlight[] = [
  {
    id: 'logs',
    name: 'Logs',
    icon: 'logs',
    color: 'var(--module-logs)',
    files: ['*.logs.yaml', 'logs/parsers.yaml'],
    summary: 'Live tail and search over CloudWatch and OpenSearch, one file per service.',
    points: [
      'Parsers turn lines into fields you can filter',
      'Lookups show a tenant name where the log has an id',
      'Saved views, and every log is also a table in SQL',
    ],
    sample: {
      file: 'logs/checkout-api.logs.yaml',
      language: 'yaml',
      code: `kind: logs
name: checkout_api
source: cloudwatch
group: /aws/lambda/checkout-api
parser: checkout-api          # logs/parsers.yaml
views:
  errors: level = 'ERROR'
  slow: duration_ms > 2000
sql_table: logs.checkout_api  # also a table in SQL`,
    },
  },
  {
    id: 'scripts',
    name: 'Scripts',
    icon: 'script',
    color: 'var(--module-scripts)',
    files: ['*.script.yaml', 'runs/<name>/*.json'],
    summary: 'A form over a TypeScript file. Run it, watch the progress, read a real report.',
    points: [
      'params become fields, presets fill them',
      'Metrics, checks, tables and 9 chart types',
      'Every run is kept as plain JSON next to the script',
    ],
    sample: {
      file: 'scripts/refund-estimate.script.yaml',
      language: 'yaml',
      code: `kind: script
title: Refund estimate
run: refund-estimate.ts
uses: [orders_db]          # the sources it may query
params:
  since:
    type: time
    default: now-7d
  tenants:
    type: lookup           # shows names, the script gets ids
    lookup: tenant`,
    },
  },
  {
    id: 'k8s',
    name: 'Kubernetes',
    icon: 'k8s',
    color: 'var(--module-k8s)',
    files: ['*.cluster.yaml'],
    summary: 'A cluster per environment through kubectl and your kube contexts.',
    points: [
      'Resource lists with a : command bar and single-key actions',
      'Pod logs with the parsers of the Logs module',
      'Port-forwards and saved views, named in the file',
    ],
    sample: {
      file: 'k8s/acme.cluster.yaml',
      language: 'yaml',
      code: `kind: cluster
name: acme
environments:
  dev:
    context: docker-desktop
  prod:
    context: eks-acme-prod
    read_only: true          # no shell, restart, scale or delete
views:
  failing: pods status in (Error, CrashLoopBackOff, Pending)
port_forwards:
  billing-api: svc/billing-api 18080:80`,
    },
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: 'redis',
    color: 'var(--module-redis)',
    files: ['*.keys.yaml', '*.redis'],
    summary: 'A keys view that reads key names like fields. Safe by design.',
    points: [
      'Search, sort and filter keys by the parts of their name',
      'Never sends KEYS, FLUSHALL or CONFIG',
      'Every command lands in an audit log',
    ],
    sample: {
      file: 'redis/shop-cache.keys.yaml',
      language: 'yaml',
      code: `kind: keys
name: shop_cache
source: redis_main
patterns:
  cart:*:
    key: cart:{tenant_id}:{cart_id}
    columns: [key, tenant_id, cart_id, items, status, ttl]
  session:*:
    key: session:{session_id}
    decode: gzip+json
views:
  no-ttl: ttl = none`,
    },
  },
];

export const MODULES: ModuleCard[] = [
  {
    id: 'data',
    name: 'Data',
    icon: 'database',
    color: 'var(--module-data)',
    files: ['*.source.yaml', '*.sql', '*.lookup.yaml'],
    summary: 'Postgres, OpenSearch and CloudWatch sources with a connection per environment.',
  },
  {
    id: 'http',
    name: 'HTTP',
    icon: 'globe',
    color: 'var(--module-http)',
    files: ['*.http', '*.capture.yaml'],
    summary: 'Requests with TypeScript functions, environment variables and endpoints captured from Chrome.',
  },
  {
    id: 'git',
    name: 'Git',
    icon: 'branch',
    color: 'var(--module-git)',
    files: ['inside a repository'],
    summary: 'Changes, diffs, the commit box, branches and history, without leaving the workbench.',
  },
  {
    id: 'prompts',
    name: 'Prompts',
    icon: 'claude',
    color: 'var(--module-prompts)',
    files: ['*.prompt.md'],
    summary: 'Tasks for Claude written as specs, reviewed like code and kept next to it.',
  },
  {
    id: 'access',
    name: 'Access',
    icon: 'shield',
    color: 'var(--module-access)',
    files: ['*.proxy.yaml'],
    summary: 'A local gate to services behind Teleport. Rules decide which requests pass.',
  },
  {
    id: 'builds',
    name: 'Builds',
    icon: 'eye',
    color: 'var(--module-builds)',
    files: ['*.watch.yaml'],
    summary: 'Follow a push on GitHub from the build to every environment.',
  },
];

export const WORKFLOW: WorkflowStep[] = [
  {
    eyebrow: 'Plain files',
    title: 'A project is a folder in git',
    text: 'Sources, queries, requests, clusters and scripts are small YAML, SQL and .http files. The suffix decides the kind, so arrange the folders as you like. Review a change to your tooling in a pull request, like any other code.',
    points: ['Validation with file:line:col', 'A file edited by hand applies as soon as it parses', 'Shared by the whole team through git'],
    sample: {
      file: 'sources/orders.source.yaml',
      language: 'yaml',
      code: `kind: source
name: orders_db               # other files refer to this name
type: postgres
environments:
  dev:
    host: localhost:5433
    database: orders
    user: opsbuf_dev
  prod:
    host: orders-replica.prod.internal:5432
    database: orders
    user: opsbuf_readonly
    password: \${keychain:orders-prod}   # never a secret in git
    read_only: true
tables: auto                  # every table in schema public`,
    },
  },
  {
    eyebrow: 'Environments',
    title: 'One switch for every environment',
    text: 'A coloured bar on top tells you where you are. Switch with ⌘1 … ⌘9 and every module follows: queries, logs, requests, clusters and scripts.',
    points: ['read_only and confirm_writes per environment', 'An extra confirmation on production', 'Every submit appended to .opsbuf/history.jsonl'],
    sample: {
      file: 'environments.yaml',
      language: 'yaml',
      code: `# The order is the order of the switch and of ⌘1 … ⌘9.
kind: environments
environments:
  dev:
    label: DEV
    color: '#7fd4a3'
    variables:
      baseUrl: http://localhost:8080
  test:
    label: TEST
    color: '#e0c46c'
  prod:
    label: PROD
    color: '#ef7b6b'
    read_only: true
    confirm_writes: true`,
    },
  },
  {
    eyebrow: 'Command line',
    title: 'The same core in your terminal and CI',
    text: 'The opsbuf CLI shares its Rust core with the desktop app. Validate projects in CI, dry-run a change set, send a request or run a script from a shell.',
    points: ['opsbuf validate exits 1 on errors', 'apply refuses prod without --yes', 'JSON output for your own tools'],
    sample: {
      file: 'terminal',
      language: 'shell',
      code: `opsbuf validate .
# ✓ 21 files, 0 errors

opsbuf http send http/billing.http#3 --env dev
# 200 OK · 142 ms

opsbuf script run scripts/refund-estimate.script.yaml --env prod --set since=now-7d
# ✓ refunds: 1 284 · estimate: € 18 420

opsbuf apply changes.json --env prod --dry-run`,
    },
  },
  {
    eyebrow: 'AI native',
    title: 'Built for working with Claude',
    text: 'opsbuf writes docs for every file kind and points your CLAUDE.md at them. An assistant writes a query or a script in the documented format, runs opsbuf validate, and opsbuf picks the change up at once.',
    points: ['Docs that always match the installed version', 'Prompts module for reviewed tasks', 'Rules: documented fields only, no secrets'],
    sample: {
      file: 'prompts/tenant-names.prompt.md',
      language: 'yaml',
      code: `# Show tenant names in HTTP responses

## Goal
Every tenantId in a response shows the tenant name next to it.

## Context
- lookups/tenant.lookup.yaml maps the id to the name
- http/billing.http has the requests to check

## Done when
- opsbuf validate . passes
- request #3 shows "Acme Corp" next to its id`,
    },
  },
];

export const SECURITY: SecurityPoint[] = [
  {
    icon: 'lock',
    title: 'Secrets stay in the Keychain',
    text: 'Files say ${keychain:name}. opsbuf reads the macOS Keychain when it needs the value, so nothing secret lands in git.',
  },
  {
    icon: 'shield',
    title: 'Production is read-only',
    text: 'Mark an environment read_only and writes are refused. confirm_writes asks first. PROD always asks twice.',
  },
  {
    icon: 'file',
    title: 'Audit of every action',
    text: 'Submits go to history.jsonl, Redis commands to an audit log with the key, never the value.',
  },
  {
    icon: 'folder',
    title: 'Sandboxed to the project',
    text: 'The core refuses to read outside the project root. The app grants its window exactly the commands it declares.',
  },
  {
    icon: 'redis',
    title: 'Safe commands only',
    text: 'No KEYS, FLUSHALL or CONFIG on Redis. Deletes show what they remove before they run.',
  },
  {
    icon: 'eye',
    title: 'Local and native',
    text: 'A Rust core in a Tauri 2 app. Your data goes from your machine to your systems, not through ours.',
  },
];

export const QUESTIONS: Question[] = [
  {
    question: 'Which platforms does opsbuf run on?',
    answer: 'The release build is for macOS on Apple Silicon. The core and the CLI are Rust and build on Linux and Windows too.',
  },
  {
    question: 'What does a license cover?',
    answer: 'Every module, the opsbuf CLI and the Chrome plugin, with every update while the license runs. Personal covers 2 machines, each Team seat covers 3.',
  },
  {
    question: 'How do I activate opsbuf on a machine?',
    answer: 'Sign in here, copy the license key from Licenses and paste it into opsbuf. You can see every activated machine and free one up at any time.',
  },
  {
    question: 'Can I move seats between people?',
    answer: 'Yes. The owner of a Team license assigns seats by email and takes them back. A teammate signs in with their email and sees the key.',
  },
  {
    question: 'What happens when I cancel?',
    answer: 'The license keeps working until the end of the paid period. Then it stops renewing. You can resume it before that date.',
  },
  {
    question: 'Does opsbuf send my data anywhere?',
    answer: 'No. opsbuf connects from your machine to your own databases, clusters and APIs. Only the license check talks to us.',
  },
];
