import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeLanguage, highlightCode } from '../ui/highlight';
import { Icon } from '../ui/icon';
import { MODULES } from './content';

type EnvironmentKey = 'dev' | 'test' | 'prod';
type PreviewKind = 'table' | 'logs' | 'response' | 'report';

interface PreviewEnvironment {
  key: EnvironmentKey;
  label: string;
  color: string;
  shortcut: string;
}

interface PreviewTab {
  moduleId: string;
  file: string;
  kind: PreviewKind;
  language: CodeLanguage;
  code: string;
}

const ENVIRONMENTS: PreviewEnvironment[] = [
  { key: 'dev', label: 'DEV', color: 'var(--env-dev)', shortcut: '⌘1' },
  { key: 'test', label: 'TEST', color: 'var(--env-test)', shortcut: '⌘2' },
  { key: 'prod', label: 'PROD', color: 'var(--env-prod)', shortcut: '⌘3' },
];

const TABS: PreviewTab[] = [
  {
    moduleId: 'data',
    file: 'failed-payments.sql',
    kind: 'table',
    language: 'sql',
    code: `-- failed payments per tenant, last 24 h
select tenant_id, count(*) as failed
from payments
where status = 'failed'
  and created_at > now() - interval '1 day'
group by tenant_id
order by failed desc
limit 5`,
  },
  {
    moduleId: 'logs',
    file: 'checkout-api.logs.yaml',
    kind: 'logs',
    language: 'yaml',
    code: `kind: logs
name: checkout_api
source: cloudwatch
group: /aws/lambda/checkout-api
fields: [level, tenant, duration_ms]
searches:
  errors: level = 'ERROR'`,
  },
  {
    moduleId: 'http',
    file: 'billing.http',
    kind: 'response',
    language: 'http',
    code: `### Refunds of one tenant
GET {{BASE_URL}}/v1/tenants/{{tenantId}}/refunds
Authorization: Bearer {{acquireToken()}}`,
  },
  {
    moduleId: 'scripts',
    file: 'refund-estimate.script.yaml',
    kind: 'report',
    language: 'yaml',
    code: `kind: script
title: Refund estimate
run: refund-estimate.ts
uses: [orders_db]
params:
  since: { type: date, default: now-30d }`,
  },
];

const TABLE_ROWS = [
  { tenant: 'Acme Corp', failed: 128 },
  { tenant: 'Globex', failed: 86 },
  { tenant: 'Initech', failed: 41 },
  { tenant: 'Umbrella', failed: 17 },
  { tenant: 'Hooli', failed: 9 },
];

const LOG_LINES = [
  { time: '14:02:11', level: 'INFO', text: 'checkout started tenant=acme cart=3 items' },
  { time: '14:02:11', level: 'WARN', text: 'card 3DS took 2 140 ms tenant=globex' },
  { time: '14:02:12', level: 'ERROR', text: 'payment declined code=insufficient_funds' },
  { time: '14:02:13', level: 'INFO', text: 'refund queued id=rf_81 amount=€42.00' },
  { time: '14:02:14', level: 'INFO', text: 'checkout done tenant=acme 412 ms' },
];

const REPORT_BARS = [42, 58, 35, 71, 64, 88, 76];

@Component({
  selector: 'opsbuf-workbench-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="window" [style.--env]="environment().color">
      <div class="env-bar"></div>
      <div class="titlebar">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="project">payments-incident</span>
        <span class="switch">
          @for (env of environments; track env.key) {
            <button type="button" [class.active]="env.key === environment().key" (click)="selectEnvironment(env.key)">
              <i [style.background]="env.color"></i>{{ env.label }}
              <kbd>{{ env.shortcut }}</kbd>
            </button>
          }
        </span>
      </div>
      <div class="body">
        <nav class="rail">
          @for (module of modules; track module.id) {
            <button
              type="button"
              [class.active]="module.id === activeTab().moduleId"
              [class.idle]="!hasTab(module.id)"
              [style.color]="module.color"
              [attr.aria-label]="module.name"
              [title]="module.name"
              (click)="selectModule(module.id)"
            >
              <opsbuf-icon [name]="module.icon" [size]="18" />
            </button>
          }
        </nav>
        <div class="workspace">
          <div class="tabs">
            @for (tab of tabs; track tab.file) {
              <button type="button" [class.active]="tab === activeTab()" (click)="selectModule(tab.moduleId)">
                {{ tab.file }}
              </button>
            }
          </div>
          <div class="split">
            <pre class="file" [innerHTML]="activeCode()"></pre>
            <div class="view">
              @if (environment().key === 'prod') {
                <div class="readonly"><opsbuf-icon name="lock" [size]="13" /> PROD is read-only</div>
              }
              @switch (activeTab().kind) {
                @case ('table') {
                  <table>
                    <thead>
                      <tr><th>tenant</th><th>failed</th><th></th></tr>
                    </thead>
                    <tbody>
                      @for (row of tableRows(); track row.tenant) {
                        <tr>
                          <td>{{ row.tenant }}</td>
                          <td class="number">{{ row.failed }}</td>
                          <td class="bar-cell"><span class="bar" [style.width.%]="row.share"></span></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
                @case ('logs') {
                  <div class="logs">
                    @for (line of logLines; track $index) {
                      <div class="line" [class]="line.level.toLowerCase()">
                        <span class="time">{{ line.time }}</span>
                        <span class="level">{{ line.level }}</span>
                        <span>{{ line.text }}</span>
                      </div>
                    }
                    <div class="line live"><span class="pulse"></span> live tail · {{ environment().label }}</div>
                  </div>
                }
                @case ('response') {
                  <div class="response">
                    <div class="status"><span class="ok">200 OK</span> · 142 ms · 1.2 kB</div>
                    <pre>{{ responseBody }}</pre>
                  </div>
                }
                @case ('report') {
                  <div class="report">
                    <div class="metrics">
                      <div><span>refunds</span><strong>1 284</strong></div>
                      <div><span>estimate</span><strong>€ 18 420</strong></div>
                      <div><span>checks</span><strong class="ok">4 / 4</strong></div>
                    </div>
                    <div class="chart">
                      @for (bar of reportBars; track $index) {
                        <span [style.height.%]="bar"></span>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
          <div class="status-bar">
            <span><i [style.background]="environment().color"></i>{{ environment().label }}</span>
            <span>21 files · 0 errors</span>
            <span class="right">opsbuf 1.9 · Rust core</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './workbench-preview.scss',
})
export class WorkbenchPreview {
  protected readonly environments = ENVIRONMENTS;
  protected readonly modules = MODULES;
  protected readonly tabs = TABS;
  protected readonly logLines = LOG_LINES;
  protected readonly reportBars = REPORT_BARS;
  protected readonly responseBody = `{
  "tenant": "acme",  // Acme Corp
  "refunds": [
    { "id": "rf_81", "amount": 42.00, "status": "queued" }
  ]
}`;

  private readonly environmentKey = signal<EnvironmentKey>('dev');
  private readonly activeModuleId = signal('data');

  protected readonly environment = computed(
    () => ENVIRONMENTS.find((it) => it.key === this.environmentKey()) ?? ENVIRONMENTS[0],
  );
  protected readonly activeTab = computed(
    () => TABS.find((it) => it.moduleId === this.activeModuleId()) ?? TABS[0],
  );
  protected readonly activeCode = computed(() => highlightCode(this.activeTab().code, this.activeTab().language));
  protected readonly tableRows = computed(() => {
    const scale = this.environmentKey() === 'prod' ? 3 : this.environmentKey() === 'test' ? 0.4 : 0.1;
    const maxFailed = Math.max(...TABLE_ROWS.map((it) => it.failed));
    return TABLE_ROWS.map((it) => ({
      tenant: it.tenant,
      failed: Math.max(1, Math.round(it.failed * scale)),
      share: (it.failed / maxFailed) * 100,
    }));
  });

  protected selectEnvironment(key: EnvironmentKey): void {
    this.environmentKey.set(key);
  }

  protected selectModule(moduleId: string): void {
    if (this.hasTab(moduleId)) this.activeModuleId.set(moduleId);
  }

  protected hasTab(moduleId: string): boolean {
    return TABS.some((it) => it.moduleId === moduleId);
  }
}
