import { IconName } from '../../ui/icons';

export type SceneId = 'logs' | 'k8s' | 'redis' | 'scripts';
export type EnvironmentKey = 'dev' | 'test' | 'prod';

export interface ShowcaseEnvironment {
  key: EnvironmentKey;
  label: string;
  color: string;
}

export interface RailModule {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}

export interface Scene {
  id: SceneId;
  step: string;
  caption: string;
  moduleId: string;
  folder: string;
  file: string;
  otherFiles: string[];
  kind: string;
  action: string;
  modes: string[];
  activeMode: string;
}

export const ENVIRONMENTS: ShowcaseEnvironment[] = [
  { key: 'dev', label: 'DEV', color: 'var(--env-dev)' },
  { key: 'test', label: 'TEST', color: 'var(--env-test)' },
  { key: 'prod', label: 'PROD', color: 'var(--env-prod)' },
];

export const RAIL_MODULES: RailModule[] = [
  { id: 'project', name: 'Project', icon: 'folder', color: 'var(--module-project)' },
  { id: 'git', name: 'Git', icon: 'branch', color: 'var(--module-git)' },
  { id: 'data', name: 'Data', icon: 'database', color: 'var(--module-data)' },
  { id: 'logs', name: 'Logs', icon: 'logs', color: 'var(--module-logs)' },
  { id: 'redis', name: 'Redis', icon: 'redis', color: 'var(--module-redis)' },
  { id: 'http', name: 'HTTP', icon: 'globe', color: 'var(--module-http)' },
  { id: 'k8s', name: 'Kubernetes', icon: 'k8s', color: 'var(--module-k8s)' },
  { id: 'scripts', name: 'Scripts', icon: 'script', color: 'var(--module-scripts)' },
  { id: 'prompts', name: 'Prompts', icon: 'claude', color: 'var(--module-prompts)' },
  { id: 'access', name: 'Access', icon: 'shield', color: 'var(--module-access)' },
  { id: 'builds', name: 'Builds', icon: 'eye', color: 'var(--module-builds)' },
];

const VIEW_MODES = ['File', 'Split', 'View'];

export const SCENES: Scene[] = [
  {
    id: 'logs',
    step: '01',
    caption: 'Find the error',
    moduleId: 'logs',
    folder: 'logs',
    file: 'checkout-api.logs.yaml',
    otherFiles: ['parsers.yaml', 'all-services.logs.yaml', 'payment-worker.logs.yaml'],
    kind: 'logs',
    action: 'Update query',
    modes: VIEW_MODES,
    activeMode: 'View',
  },
  {
    id: 'k8s',
    step: '02',
    caption: 'See the pod crash',
    moduleId: 'k8s',
    folder: 'k8s',
    file: 'acme.cluster.yaml',
    otherFiles: ['fleet.cluster.yaml'],
    kind: 'cluster',
    action: 'Refresh',
    modes: VIEW_MODES,
    activeMode: 'View',
  },
  {
    id: 'redis',
    step: '03',
    caption: 'Check the stuck carts',
    moduleId: 'redis',
    folder: 'redis',
    file: 'shop-cache.keys.yaml',
    otherFiles: ['debug.redis'],
    kind: 'keys',
    action: 'Update',
    modes: VIEW_MODES,
    activeMode: 'View',
  },
  {
    id: 'scripts',
    step: '04',
    caption: 'Estimate the refunds',
    moduleId: 'scripts',
    folder: 'scripts',
    file: 'refund-estimate.script.yaml',
    otherFiles: ['refund-estimate.ts', 'fx-rates.script.yaml', 'payments-overview.script.yaml'],
    kind: 'script',
    action: 'Run script',
    modes: ['File', 'Split', 'Form', 'Runs'],
    activeMode: 'Form',
  },
];
