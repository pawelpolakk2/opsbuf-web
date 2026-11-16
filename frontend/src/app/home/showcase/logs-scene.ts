import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CountUp } from '../../ui/count-up';
import { Icon } from '../../ui/icon';
import { ClaudeComment } from './claude-comment';
import { SourceFileView } from './source-file';

interface HistogramBar {
  height: number;
  errorShare: number;
}

interface LogRow {
  time: string;
  tenant: string;
  requestId: string;
  message: string;
  durationMs: number;
}

const QUIET_HEIGHTS = [34, 30, 38, 32, 36, 30, 40, 33, 37, 31, 35, 39, 32, 36, 30, 34, 38, 33, 36, 31, 35, 32, 37, 34];
const INCIDENT_BARS: HistogramBar[] = [
  { height: 46, errorShare: 30 },
  { height: 62, errorShare: 62 },
  { height: 84, errorShare: 78 },
  { height: 100, errorShare: 86 },
  { height: 92, errorShare: 84 },
];
const BARS: HistogramBar[] = [...QUIET_HEIGHTS.map((height) => ({ height, errorShare: 0 })), ...INCIDENT_BARS];

const ROWS: LogRow[] = [
  { time: '14:08:49.871', tenant: 'Vistula Bikes', requestId: 'req_2c44b0', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5002 },
  { time: '14:08:47.332', tenant: 'Amber Jewelry', requestId: 'req_91fa03', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5001 },
  { time: '14:08:44.019', tenant: 'Acme Retail', requestId: 'req_5b20c7', message: 'capture failed: billing-api unavailable', durationMs: 5003 },
  { time: '14:08:41.560', tenant: 'Polar Outfitters', requestId: 'req_e04d11', message: 'upstream timeout: billing-api (5000 ms)', durationMs: 5002 },
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
  template: `
    <div class="views">
      <span class="view-chip">all</span>
      <span class="view-chip active">errors</span>
      <span class="view-chip">slow</span>
      <span class="spacer"></span>
      <span class="tool-button"><opsbuf-icon name="columns" [size]="13" /> Columns</span>
    </div>
    <div class="search-bar">
      <div class="search-line">
        <span class="search">
          <opsbuf-icon name="magnifier" [size]="14" />
          <span class="typed" style="--chars: 15"><span class="tok-key">level</span> = <span class="tok-string">'ERROR'</span></span>
          <span class="caret"></span>
        </span>
        <span class="ranges"><span>15 m</span><span class="active">1 h</span><span>24 h</span></span>
        <span class="tool-button update">Update</span>
        <span class="tool-button live"><i></i> Live</span>
      </div>
    </div>
    <div class="histogram">
      <div class="count">
        <span class="total"><span [opsbufCountUp]="1184" separator="," [delayMs]="1500"></span> events</span>
        <span class="period">last 1 h · per 2 min</span>
      </div>
      <div class="bars">
        @for (bar of bars; track $index) {
          <span class="bar" [style.height.%]="bar.height" [style.--i]="$index">
            <i [style.height.%]="bar.errorShare"></i>
          </span>
        }
      </div>
      <div class="ticks"><span>13:10</span><span>13:30</span><span>13:50</span><span>14:10</span></div>
    </div>
    <div class="table mono">
      <div class="row head">
        <span></span><span>ts</span><span>level</span><span class="tenant">tenant_id</span><span class="extra">request_id</span><span>message</span>
        <span class="duration">duration_ms</span>
      </div>
      <div class="row expanded" style="--i: 0">
        <span class="toggle">▾</span><span>14:08:51.204</span><span class="level">ERROR</span>
        <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />Acme Retail</b></span>
        <span class="extra">req_7d1e9a</span><span class="message">upstream timeout: billing-api (5000 ms)</span>
        <span class="duration">5004</span>
      </div>
      <div class="fields">
        <div>
          <span>tenant_id</span>
          <span>7f3a9c12 <b class="lookup">Acme Retail</b></span>
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
      @for (row of rows; track row.requestId) {
        <div class="row" [style.--i]="$index + 1">
          <span class="toggle">▸</span><span>{{ row.time }}</span><span class="level">ERROR</span>
            <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />{{ row.tenant }}</b></span>
          <span class="extra">{{ row.requestId }}</span><span class="message">{{ row.message }}</span>
          <span class="duration">{{ row.durationMs }}</span>
        </div>
      }
    </div>
    <opsbuf-source-file (opened)="fileOpened.emit()" />
  `,
  styleUrl: './logs-scene.scss',
})
export class LogsScene {
  readonly fileOpened = output<void>();

  protected readonly bars = BARS;
  protected readonly rows = ROWS;
  protected readonly stackFrames = STACK_FRAMES;
}
