import { ChangeDetectionStrategy, Component } from '@angular/core';

type PodState = 'running' | 'crashing' | 'failed';

interface Pod {
  namespace: string;
  name: string;
  ready: string;
  status: string;
  restarts: number;
  cpu: string;
  memory: string;
  age: string;
  state: PodState;
  isSelected: boolean;
}

interface PodLogLine {
  time: string;
  level: 'INFO' | 'ERROR';
  text: string;
}

const FACTS = [
  { label: 'Context', value: 'docker-desktop' },
  { label: 'Cluster', value: 'acme' },
  { label: 'K8s', value: 'v1.30.2' },
  { label: 'Nodes', value: '1' },
  { label: 'CPU', value: '22%' },
  { label: 'MEM', value: '48%' },
];

const RESOURCES = [
  { name: 'Pods', count: 10 },
  { name: 'Deployments', count: 4 },
  { name: 'Services', count: 4 },
  { name: 'Events', count: 6 },
];

const NAMESPACES = ['all', 'shop', 'payments', 'infra', 'checkout', 'ledger'];
const SAVED_VIEWS = ['incident', 'shop', 'failing'];

const PODS: Pod[] = [
  { namespace: 'payments', name: 'billing-api-6c8f9d7b5-2kx9q', ready: '1/1', status: 'Running', restarts: 0, cpu: '212m', memory: '318Mi', age: '12m', state: 'running', isSelected: false },
  { namespace: 'payments', name: 'billing-api-6c8f9d7b5-8wq4m', ready: '1/1', status: 'Running', restarts: 0, cpu: '240m', memory: '331Mi', age: '12m', state: 'running', isSelected: false },
  { namespace: 'payments', name: 'billing-api-6c8f9d7b5-tp7rz', ready: '0/1', status: 'CrashLoopBackOff', restarts: 5, cpu: '0m', memory: '42Mi', age: '12m', state: 'crashing', isSelected: true },
  { namespace: 'payments', name: 'billing-migrate-v2-41-9xk2p', ready: '0/1', status: 'Error', restarts: 0, cpu: '0m', memory: '0Mi', age: '14m', state: 'failed', isSelected: false },
  { namespace: 'payments', name: 'billing-db-proxy-7f6d5c4b3-m2ke8', ready: '1/1', status: 'Running', restarts: 0, cpu: '36m', memory: '64Mi', age: '41d', state: 'running', isSelected: false },
];

const ACTIONS = [
  { key: 'l', label: 'Logs', isWrite: false },
  { key: 'd', label: 'Describe', isWrite: false },
  { key: 'y', label: 'YAML', isWrite: false },
  { key: 'e', label: 'Events', isWrite: false },
  { key: 'f', label: 'Port-forward', isWrite: false },
  { key: 's', label: 'Shell', isWrite: true },
  { key: '^d', label: 'Delete', isWrite: true },
];

const LOG_LINES: PodLogLine[] = [
  { time: '14:10:02', level: 'INFO', text: 'starting billing-api v2.41' },
  { time: '14:10:02', level: 'INFO', text: 'connecting to billing-db-proxy:5432' },
  { time: '14:10:07', level: 'ERROR', text: 'migration check failed: column invoices.retry_count does not exist' },
  { time: '14:10:07', level: 'ERROR', text: 'exit code 1, container restarts (5 so far)' },
];

@Component({
  selector: 'opsbuf-cluster-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="facts">
      @for (fact of facts; track fact.label) {
        <span class="fact"><span class="label">{{ fact.label }}</span><span class="mono">{{ fact.value }}</span></span>
      }
    </div>
    <div class="toolbar">
      <span class="command">
        <span class="prompt">›</span>
        <span class="typed" style="--chars: 5">:pods</span>
        <span class="caret"></span>
      </span>
      <span class="resources">
        @for (resource of resources; track resource.name) {
          <span [class.active]="$first">{{ resource.name }} <i>{{ resource.count }}</i></span>
        }
      </span>
    </div>
    <div class="filters">
      <span class="caption">Namespace</span>
      @for (namespace of namespaces; track namespace) {
        <span class="chip" [class.namespace-active]="namespace === 'payments'">{{ namespace }}</span>
      }
      <span class="divider"></span>
      @for (view of savedViews; track view) {
        <span class="chip" [class.view-active]="$first">{{ view }}</span>
      }
    </div>
    <div class="table mono">
      <div class="row head">
        <span class="namespace">NAMESPACE</span><span>NAME</span><span class="ready">READY</span><span>STATUS</span>
        <span class="number">RESTARTS</span><span class="number usage">CPU</span><span class="number usage">MEM</span>
        <span class="number age">AGE</span>
      </div>
      @for (pod of pods; track pod.name) {
        <div class="row" [class]="pod.state" [class.selected]="pod.isSelected" [style.--i]="$index">
          <span class="namespace">{{ pod.namespace }}</span><span>{{ pod.name }}</span>
          <span class="ready">{{ pod.ready }}</span><span class="status">{{ pod.status }}</span>
          <span class="number">{{ pod.restarts }}</span><span class="number usage">{{ pod.cpu }}</span>
          <span class="number usage">{{ pod.memory }}</span><span class="number age">{{ pod.age }}</span>
        </div>
      }
    </div>
    <div class="actions">
      @for (action of actions; track action.key) {
        <span class="action" [class.write]="action.isWrite" [class.pressed]="$first">
          <kbd>{{ action.key }}</kbd> {{ action.label }}
        </span>
      }
    </div>
    <div class="detail">
      <div class="detail-bar">
        <span class="detail-tab active">Logs</span><span class="detail-tab">Describe</span>
        <span class="detail-tab">YAML</span><span class="detail-tab">Events</span>
        <span class="selected-label mono">pod/billing-api-6c8f9d7b5-tp7rz</span>
        <span class="spacer"></span>
        <span class="parser mono">parser: billing-api</span>
        <span class="save-logs">Save as logs file</span>
      </div>
      <div class="detail-body mono">
        @for (line of logLines; track $index) {
          <div class="line" [style.--i]="$index">
            <span class="time">{{ line.time }}</span>
            <span [class.error]="line.level === 'ERROR'" [class.info]="line.level === 'INFO'">{{ line.level }}</span>
            {{ line.text }}
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './cluster-scene.scss',
})
export class ClusterScene {
  protected readonly facts = FACTS;
  protected readonly resources = RESOURCES;
  protected readonly namespaces = NAMESPACES;
  protected readonly savedViews = SAVED_VIEWS;
  protected readonly pods = PODS;
  protected readonly actions = ACTIONS;
  protected readonly logLines = LOG_LINES;
}
