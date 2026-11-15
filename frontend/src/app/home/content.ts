import { CodeLanguage } from '../ui/highlight';
import { IconName } from '../ui/icons';

export interface ModuleCard {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  files: string[];
  summary: string;
  points: string[];
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

export const MODULES: ModuleCard[] = [
  {
    id: 'project',
    name: 'Project',
    icon: 'folder',
    color: 'var(--module-project)',
    files: ['environments.yaml', 'project.json', '*.md'],
    summary: 'The folder itself. Its tree shows every file, and every setting lives in git.',
    points: ['Environments with label, color and read-only flag', 'Notes next to the definitions', 'Shortcuts and npm packages in project.json'],
  },
  {
    id: 'data',
    name: 'Data',
    icon: 'database',
    color: 'var(--module-data)',
    files: ['*.source.yaml', '*.sql', '*.lookup.yaml', '*.csv'],
    summary: 'Postgres, OpenSearch and CloudWatch sources with a connection per environment.',
    points: ['SQL files you review like code', 'Edit cells, preview the change set, then apply', 'Lookups turn ids into names everywhere'],
  },
  {
    id: 'logs',
    name: 'Logs',
    icon: 'logs',
    color: 'var(--module-logs)',
    files: ['*.logs.yaml', 'logs/parsers.yaml'],
    summary: 'Live tail and search over CloudWatch and OpenSearch, one file per service.',
    points: ['Parsers turn lines into fields', 'Saved searches and labels', 'Query logs with SQL, like a table'],
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: 'redis',
    color: 'var(--module-redis)',
    files: ['*.keys.yaml', '*.redis'],
    summary: 'A keys view that reads key names like fields. Safe by design.',
    points: ['Snapshot, sort and filter keys by their parts', 'Never sends KEYS, FLUSHALL or CONFIG', 'Every command lands in an audit log'],
  },
  {
    id: 'http',
    name: 'HTTP',
    icon: 'globe',
    color: 'var(--module-http)',
    files: ['*.http', '*.capture.yaml', '*.ts'],
    summary: 'Requests with TypeScript functions and the variables of the active environment.',
    points: ['Monaco editor with completion inside {{ }}', 'Capture endpoints from Chrome', 'Reuse logged-in sessions from the Keychain'],
  },
  {
    id: 'k8s',
    name: 'Kubernetes',
    icon: 'k8s',
    color: 'var(--module-k8s)',
    files: ['*.cluster.yaml'],
    summary: 'A cluster per environment through kubectl and your kube contexts.',
    points: ['Resource lists with a : command bar', 'Pod metrics at a glance', 'Terminals right inside the workbench'],
  },
  {
    id: 'scripts',
    name: 'Scripts',
    icon: 'script',
    color: 'var(--module-scripts)',
    files: ['*.script.yaml'],
    summary: 'A form over a TypeScript file. Params, presets, progress and a real report.',
    points: ['sql(), lookup() and env built in', 'Metrics, checks, tables and 9 chart types', 'Every run is kept as plain JSON'],
  },
  {
    id: 'prompts',
    name: 'Prompts',
    icon: 'claude',
    color: 'var(--module-prompts)',
    files: ['*.prompt.md'],
    summary: 'Tasks for Claude written as specs, reviewed like code, kept next to it.',
    points: ['Plain Markdown in git', 'Goal, context and checks in one file', 'The view shows everything the file says'],
  },
  {
    id: 'access',
    name: 'Access',
    icon: 'shield',
    color: 'var(--module-access)',
    files: ['*.proxy.yaml'],
    summary: 'A local gate to services behind Teleport. Rules decide which requests pass.',
    points: ['Encrypted vault, unlocked for a while', 'Sessions and audit in the view', 'Credentials never touch the file'],
  },
  {
    id: 'builds',
    name: 'Builds',
    icon: 'eye',
    color: 'var(--module-builds)',
    files: ['*.watch.yaml'],
    summary: 'Follow a push on GitHub from the build to every environment.',
    points: ['Pull requests waiting for you', 'Failures before your teammates ask', 'Token from the Keychain, never from the file'],
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
    user: ptx_dev
  prod:
    host: orders-replica.prod.internal:5432
    database: orders
    user: ptx_readonly
    password: \${keychain:orders-prod}   # never a secret in git
    read_only: true
tables: auto                  # every table in schema public`,
    },
  },
  {
    eyebrow: 'Environments',
    title: 'One switch for every environment',
    text: 'A coloured bar on top tells you where you are. Switch with ⌘1 … ⌘9 and every module follows: queries, logs, requests, clusters and scripts.',
    points: ['read_only and confirm_writes per environment', 'An extra confirmation on production', 'Every submit appended to .ptx/history.jsonl'],
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
    eyebrow: 'Requests',
    title: 'HTTP with real code inside',
    text: 'Write requests next to small TypeScript functions. Variables come from the active environment, tokens from your Keychain, and the PTX plugin turns calls you click through in Chrome into endpoints.',
    points: ['Imports from lib/*.ts and npm packages', 'Completion and hover in Monaco', 'Run from the app or with ptx http send'],
    sample: {
      file: 'http/billing.http',
      language: 'http',
      code: `import { acquireToken } from './lib/auth';

### Refunds of one tenant
GET {{BASE_URL}}/v1/tenants/{{tenantId}}/refunds?since={{daysAgo(7)}}
Authorization: Bearer {{acquireToken()}}

### Retry a failed payment
# @session admin-console
POST {{BASE_URL}}/v1/payments/{{paymentId}}/retry
Content-Type: application/json

{ "reason": "{{uuid()}}" }`,
    },
  },
  {
    eyebrow: 'Scripts',
    title: 'Scripts that report, not just print',
    text: 'Turn the calculation you repeat every week into a form. Run it, watch the progress, read a report with metrics, checks and charts, and keep every run next to the script.',
    points: ['params become fields, presets fill them', 'sql() on the sources the script uses', 'ptx script run does the same in a terminal'],
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
    type: lookup
    lookup: tenant         # shows names, the script gets ids
    multiple: true
presets:
  last-month:
    since: now-30d`,
    },
  },
  {
    eyebrow: 'Command line',
    title: 'The same core in your terminal and CI',
    text: 'The ptx CLI shares its Rust core with the desktop app. Validate projects in CI, dry-run a change set, send a request or run a script from a shell.',
    points: ['ptx validate exits 1 on errors', 'apply refuses prod without --yes', 'JSON output for your own tools'],
    sample: {
      file: 'terminal',
      language: 'shell',
      code: `ptx validate .
# ✓ 21 files, 0 errors

ptx http send http/billing.http#3 --env dev
# 200 OK · 142 ms

ptx script run scripts/refund-estimate.script.yaml --env prod --set since=now-7d
# ✓ refunds: 1 284 · estimate: € 18 420

ptx apply changes.json --env prod --dry-run`,
    },
  },
  {
    eyebrow: 'AI native',
    title: 'Built for working with Claude',
    text: 'PTX writes docs for every file kind and points your CLAUDE.md at them. An assistant writes a query or a script in the documented format, runs ptx validate, and PTX picks the change up at once.',
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
- ptx validate . passes
- request #3 shows "Acme Corp" next to its id`,
    },
  },
];

export const SECURITY: SecurityPoint[] = [
  {
    icon: 'lock',
    title: 'Secrets stay in the Keychain',
    text: 'Files say ${keychain:name}. PTX reads the macOS Keychain when it needs the value, so nothing secret lands in git.',
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
    question: 'Which platforms does PTX run on?',
    answer: 'The release build is for macOS on Apple Silicon. The core and the CLI are Rust and build on Linux and Windows too.',
  },
  {
    question: 'What does a license cover?',
    answer: 'Every module, the ptx CLI and the Chrome plugin, with every update while the license runs. Personal covers 2 machines, each Team seat covers 3.',
  },
  {
    question: 'How do I activate PTX on a machine?',
    answer: 'Sign in here, copy the license key from Licenses and paste it into PTX. You can see every activated machine and free one up at any time.',
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
    question: 'Does PTX send my data anywhere?',
    answer: 'No. PTX connects from your machine to your own databases, clusters and APIs. Only the license check talks to us.',
  },
];
