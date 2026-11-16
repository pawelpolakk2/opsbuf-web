import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Icon } from '../../ui/icon';
import { CodeToken, toCodeTokens } from './code-tokens';
import { SOURCE_FILE } from './showcase-content';

interface CodeLine {
  number: number;
  tokens: CodeToken[];
  isFailing: boolean;
}

const FIRST_LINE = 82;
const CODE = [
  'export class BillingClient {',
  '  constructor(private readonly baseUrl: string) {}',
  '',
  '  async post(path: string, body: string): Promise<Response> {',
  '    try {',
  '      const signal = AbortSignal.timeout(TIMEOUT_MS);',
  "      return await fetch(this.baseUrl + path, { method: 'POST', body, signal });",
  '    } catch {',
  '      throw new TimeoutError(`upstream timeout: billing-api (${TIMEOUT_MS} ms)`);',
  '    }',
  '  }',
];

const LINES: CodeLine[] = CODE.map((code, at) => ({
  number: FIRST_LINE + at,
  tokens: toCodeTokens(code),
  isFailing: FIRST_LINE + at === SOURCE_FILE.line,
}));

/** The file Claude opens from the other repository, with its answer under the line the stack trace names. */
@Component({
  selector: 'opsbuf-source-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { '(animationstart)': 'announceOpenedIfOwn($event)' },
  template: `
    <header class="file-bar">
      <span class="repository"><opsbuf-icon name="branch" [size]="12" />{{ file.repository }}</span>
      <span class="path mono">{{ file.path }}</span>
      <span class="spacer"></span>
      <span class="opened-by"><opsbuf-icon name="claude" [size]="12" [strokeWidth]="2" />opened by Claude from another repository</span>
    </header>
    <div class="lines mono">
      @for (line of lines; track line.number) {
        <div class="line" [class.failing]="line.isFailing" [style.--i]="$index">
          <span class="number">{{ line.number }}</span>
          <span class="text">
            @for (token of line.tokens; track $index) {
              <span [class]="'tok-' + token.kind">{{ token.text }}</span>
            }
          </span>
        </div>
        @if (line.isFailing) {
          <div class="zone">
            <div class="zone-inner">
              <div class="answer">
                <div class="answer-head">
                  <span class="state"><i></i>Check it</span>
                  <span class="place">#12 · line {{ line.number }}</span>
                </div>
                <div class="entry">
                  <span class="avatar you">Y</span>
                  <div class="message">
                    <span class="author">You</span>
                    <span>dear ai, explain this and open related file</span>
                  </div>
                </div>
                <div class="entry claude">
                  <span class="avatar"><opsbuf-icon name="claude" [size]="12" [strokeWidth]="2.4" /></span>
                  <div class="message">
                    <span class="author">Claude</span>
                    <span>
                      The stack trace ends here. <code>TIMEOUT_MS</code> is <code>5000</code> and nothing retries, so every slow
                      answer becomes this <code>TimeoutError</code>. This code is fine: <code>billing-api</code> answers too
                      slowly. Check its pods next.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './source-file.scss',
})
export class SourceFileView {
  readonly opened = output<void>();

  protected readonly file = SOURCE_FILE;
  protected readonly lines = LINES;

  // the lines inside animate too, and their events bubble up to here
  protected announceOpenedIfOwn(event: AnimationEvent): void {
    if (event.target === event.currentTarget) this.opened.emit();
  }
}
