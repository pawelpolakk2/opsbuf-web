import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CountUp } from '../../ui/count-up';
import { Icon } from '../../ui/icon';
import { ClaudeComment } from './claude-comment';
import { SourceFileView } from './source-file';

interface HistogramBar {
  height: number;
  errorShare: number;
}

type Level = 'ERROR' | 'WARN' | 'INFO';

interface LogRow {
  time: string;
  level: Level;
  tenant: string;
  requestId: string;
  message: string;
  durationMs: number;
}

/** A value the search bar offers, and when the focus sits on it, in seconds of the scene. */
interface Suggestion {
  name: string;
  detail: string;
  focusAt?: number;
  focusFor?: number;
}

interface SuggestMenu {
  /** The character of the query the menu hangs under. */
  column: number;
  shownAt: number;
  shownFor: number;
  options: Suggestion[];
}

const LEVEL_PICKED_AT = 2.1;
const TENANT_PICKED_AT = 4.4;
const UPDATE_AT = 4.7;
const PICKED_TENANT = 'Acme Retail';

const LEVEL_MENU: SuggestMenu = {
  column: 8,
  shownAt: 0.9,
  shownFor: LEVEL_PICKED_AT - 0.9,
  options: [
    { name: 'INFO', detail: 'level', focusAt: 0.9, focusFor: 0.4 },
    { name: 'WARN', detail: 'level', focusAt: 1.3, focusFor: 0.3 },
    { name: 'ERROR', detail: 'level', focusAt: 1.6, focusFor: 0.6 },
    { name: 'DEBUG', detail: 'level' },
  ],
};

const TENANT_MENU: SuggestMenu = {
  column: 28,
  shownAt: 3.1,
  shownFor: TENANT_PICKED_AT - 3.1,
  options: [
    { name: 'Vistula Bikes', detail: 'tenant_id = 2c44b0e1', focusAt: 3.1, focusFor: 0.6 },
    { name: PICKED_TENANT, detail: 'tenant_id = 7f3a9c12', focusAt: 3.7, focusFor: 0.8 },
    { name: 'Amber Jewelry', detail: 'tenant_id = 91fa03d5' },
    { name: 'Polar Outfitters', detail: 'tenant_id = e04d11a8' },
  ],
};

const toSeconds = (seconds: number | undefined): string | null => (seconds === undefined ? null : `${seconds}s`);

const QUIET_HEIGHTS = [34, 30, 38, 32, 36, 30, 40, 33, 37, 31, 35, 39, 32, 36, 30, 34, 38, 33, 36, 31, 35, 32, 37, 34];
const INCIDENT_BARS: HistogramBar[] = [
  { height: 46, errorShare: 30 },
  { height: 62, errorShare: 62 },
  { height: 84, errorShare: 78 },
  { height: 100, errorShare: 86 },
  { height: 92, errorShare: 84 },
];
const ALL_BARS: HistogramBar[] = [...QUIET_HEIGHTS.map((height) => ({ height, errorShare: 0 })), ...INCIDENT_BARS];

const QUIET_ERROR_HEIGHTS = [0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0];
const FOUND_BARS: HistogramBar[] = [...QUIET_ERROR_HEIGHTS, 32, 56, 82, 100, 90].map((height) => ({ height, errorShare: 100 }));

const ALL_ROWS: LogRow[] = [
  { time: '14:08:51.204', level: 'ERROR', tenant: 'Acme Retail', requestId: 'req_7d1e9a', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5004 },
  { time: '14:08:51.170', level: 'INFO', tenant: 'Vistula Bikes', requestId: 'req_b81c22', message: 'POST /checkout 200', durationMs: 182 },
  { time: '14:08:50.912', level: 'INFO', tenant: 'Amber Jewelry', requestId: 'req_0e7f4d', message: 'GET /cart 200', durationMs: 41 },
  { time: '14:08:50.655', level: 'WARN', tenant: 'Polar Outfitters', requestId: 'req_c3a915', message: 'slow response: inventory-api', durationMs: 2140 },
  { time: '14:08:50.301', level: 'INFO', tenant: 'Acme Retail', requestId: 'req_44d0b7', message: 'GET /cart 200', durationMs: 38 },
  { time: '14:08:49.871', level: 'ERROR', tenant: 'Vistula Bikes', requestId: 'req_2c44b0', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5002 },
  { time: '14:08:49.530', level: 'INFO', tenant: 'Polar Outfitters', requestId: 'req_9a02ee', message: 'POST /checkout 200', durationMs: 204 },
  { time: '14:08:49.212', level: 'INFO', tenant: 'Amber Jewelry', requestId: 'req_61b3f0', message: 'GET /orders/8841 200', durationMs: 57 },
  { time: '14:08:48.874', level: 'ERROR', tenant: 'Amber Jewelry', requestId: 'req_91fa03', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5001 },
  { time: '14:08:48.440', level: 'INFO', tenant: 'Vistula Bikes', requestId: 'req_d7e210', message: 'GET /cart 200', durationMs: 44 },
];

const FOUND_ROWS: LogRow[] = [
  { time: '14:08:49.871', level: 'ERROR', tenant: PICKED_TENANT, requestId: 'req_2c44b0', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5002 },
  { time: '14:08:47.332', level: 'ERROR', tenant: PICKED_TENANT, requestId: 'req_91fa03', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5001 },
  { time: '14:08:44.019', level: 'ERROR', tenant: PICKED_TENANT, requestId: 'req_5b20c7', message: 'capture failed: billing-api unavailable', durationMs: 5003 },
  { time: '14:08:41.560', level: 'ERROR', tenant: PICKED_TENANT, requestId: 'req_e04d11', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5002 },
];

interface StackFrame {
  call: string;
  file: string;
  position: string;
}

const STACK_FRAMES: StackFrame[] = [
  { call: 'BillingClient.post', file: 'src/billing-client.ts', position: ':90:13' },
  { call: 'CheckoutService.capture', file: 'src/checkout-service.ts', position: ':142:22' },
];

@Component({
  selector: 'opsbuf-logs-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, CountUp, ClaudeComment, SourceFileView],
  host: { '[style.--update-at]': 'toSeconds(updateAt)' },
  template: `
    <div class="views">
      <span class="view-chip active">all</span>
      <span class="view-chip">errors</span>
      <span class="view-chip">slow</span>
      <span class="spacer"></span>
      <span class="tool-button"><opsbuf-icon name="columns" [size]="13" /> Columns</span>
    </div>
    <div class="search-bar">
      <div class="search-line">
        <span class="search">
          <opsbuf-icon name="magnifier" [size]="14" />
          <span class="query mono">
            <span class="typed" style="--chars: 8; --type-at: 0.4s"><span class="tok-key">level</span> = </span
            ><span class="completed tok-string" style="--chars: 7" [style.--picked-at]="toSeconds(levelPickedAt)">'ERROR'</span
            ><span class="typed" style="--chars: 13; --type-at: 2.3s">&ngsp;<span class="tok-key">tenant_id</span> = </span
            ><span class="completed tok-string" style="--chars: 13" [style.--picked-at]="toSeconds(tenantPickedAt)">'{{ pickedTenant }}'</span>
          </span>
          <span class="caret"></span>
        </span>
        <span class="ranges"><span>15 m</span><span class="active">1 h</span><span>24 h</span></span>
        <span class="tool-button update">Update</span>
        <span class="tool-button live"><i></i> Live</span>
      </div>
      @for (menu of menus; track menu.column) {
        <div
          class="suggest mono"
          aria-hidden="true"
          [style.--column]="menu.column"
          [style.--shown-at]="toSeconds(menu.shownAt)"
          [style.--shown-for]="toSeconds(menu.shownFor)"
        >
          @for (option of menu.options; track option.name) {
            <div
              class="option"
              [class.stepped]="option.focusAt !== undefined"
              [style.--focus-at]="toSeconds(option.focusAt)"
              [style.--focus-for]="toSeconds(option.focusFor)"
            >
              <i></i><span class="name">{{ option.name }}</span><span class="detail">{{ option.detail }}</span>
            </div>
          }
        </div>
      }
    </div>
    <div class="histogram">
      <div class="count">
        <span class="totals">
          <span class="total before">3,912 events</span>
          <span class="total found"><span [opsbufCountUp]="96" separator="," [delayMs]="updateAt * 1000"></span> events</span>
        </span>
        <span class="period">last 1 h · per 2 min</span>
      </div>
      <div class="bars-box">
        <div class="bars before">
          @for (bar of allBars; track $index) {
            <span class="bar" [style.height.%]="bar.height"><i [style.height.%]="bar.errorShare"></i></span>
          }
        </div>
        <div class="bars found">
          @for (bar of foundBars; track $index) {
            <span class="bar" [style.height.%]="bar.height" [style.--i]="$index"><i [style.height.%]="bar.errorShare"></i></span>
          }
        </div>
      </div>
      <div class="ticks"><span>13:10</span><span>13:30</span><span>13:50</span><span>14:10</span></div>
    </div>
    <div class="table mono">
      <div class="row head">
        <span></span><span>ts</span><span>level</span><span class="tenant">tenant_id</span><span class="extra">request_id</span><span>message</span>
        <span class="duration">duration_ms</span>
      </div>
      <div class="results">
        <div class="result-set before">
          @for (row of allRows; track row.requestId) {
            <div class="row">
              <span class="toggle">▸</span><span>{{ row.time }}</span><span class="level" [class]="row.level.toLowerCase()">{{ row.level }}</span>
              <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />{{ row.tenant }}</b></span>
              <span class="extra">{{ row.requestId }}</span><span class="message">{{ row.message }}</span>
              <span class="duration">{{ row.durationMs }}</span>
            </div>
          }
        </div>
        <div class="result-set found">
          <div class="row expanded" style="--i: 0">
            <span class="toggle">▾</span><span>14:08:51.204</span><span class="level error">ERROR</span>
            <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />{{ pickedTenant }}</b></span>
            <span class="extra">req_7d1e9a</span><span class="message">upstream timeout: billing-api (5000 ms)</span>
            <span class="duration">5004</span>
          </div>
          <div class="fields">
            <div>
              <span>tenant_id</span>
              <span>7f3a9c12 <b class="lookup">{{ pickedTenant }}</b></span>
            </div>
            <div class="picked"><span>container_name</span><span class="container">checkout-api</span></div>
            <div class="picked">
              <span>message</span>
              <span class="trace">
                <span><b class="error-type">TimeoutError</b>: upstream timeout: billing-api (<span class="tok-number">5000</span> ms)</span>
                @for (frame of stackFrames; track frame.call) {
                  <span class="frame">
                    <span class="tok-keyword">at </span><span class="tok-call">{{ frame.call }}</span> (<span class="frame-file">{{ frame.file }}</span
                    ><span class="tok-number">{{ frame.position }}</span
                    >)
                  </span>
                }
              </span>
            </div>
          </div>
          <div class="comment-anchor"><opsbuf-claude-comment /></div>
          @for (row of foundRows; track row.requestId) {
            <div class="row" [style.--i]="$index + 1">
              <span class="toggle">▸</span><span>{{ row.time }}</span><span class="level error">{{ row.level }}</span>
              <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />{{ row.tenant }}</b></span>
              <span class="extra">{{ row.requestId }}</span><span class="message">{{ row.message }}</span>
              <span class="duration">{{ row.durationMs }}</span>
            </div>
          }
        </div>
      </div>
    </div>
    <opsbuf-source-file (opened)="fileOpened.emit()" />
  `,
  styleUrl: './logs-scene.scss',
})
export class LogsScene {
  readonly fileOpened = output<void>();

  protected readonly toSeconds = toSeconds;
  protected readonly updateAt = UPDATE_AT;
  protected readonly levelPickedAt = LEVEL_PICKED_AT;
  protected readonly tenantPickedAt = TENANT_PICKED_AT;
  protected readonly pickedTenant = PICKED_TENANT;
  protected readonly menus = [LEVEL_MENU, TENANT_MENU];
  protected readonly allBars = ALL_BARS;
  protected readonly foundBars = FOUND_BARS;
  protected readonly allRows = ALL_ROWS;
  protected readonly foundRows = FOUND_ROWS;
  protected readonly stackFrames = STACK_FRAMES;
}
