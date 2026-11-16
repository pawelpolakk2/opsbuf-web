import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../ui/icon';
import { SOURCE_FILE } from './showcase-content';

const QUESTION = 'dear ai, explain this and open related file';

/** The comment for Claude on the picked log fields: the question is typed, then Claude finds the repository and the file. */
@Component({
  selector: 'opsbuf-claude-comment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="quote">
      <opsbuf-icon name="claude" [size]="13" [strokeWidth]="2" />
      <span class="label">container_name, message</span>
      <span class="quoted mono">TimeoutError: upstream timeout: billing-api (5000 ms)</span>
      <span class="state"><i></i>Claude is on it</span>
    </div>
    <div class="draft">
      <span class="question" [attr.aria-label]="question">
        @for (letter of letters; track $index) {
          <span aria-hidden="true" [style.--i]="$index">{{ letter }}</span>
        }
      </span>
      <span class="send"><opsbuf-icon name="arrowUp" [size]="13" [strokeWidth]="2.2" /></span>
    </div>
    <div class="steps">
      <div class="steps-inner mono">
        <div class="step" style="--i: 0">
          <opsbuf-icon name="check" [size]="12" [strokeWidth]="2.6" />
          <span><span class="wide">container </span><b>checkout-api</b> → repo <b>{{ file.repository }}</b></span>
        </div>
        <div class="step" style="--i: 1">
          <opsbuf-icon name="check" [size]="12" [strokeWidth]="2.6" />
          <span><span class="wide">stack </span>frame → <b>{{ file.path }}:{{ file.line }}</b><span class="wide">, opening it</span></span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './claude-comment.scss',
})
export class ClaudeComment {
  protected readonly question = QUESTION;
  protected readonly letters = [...QUESTION];
  protected readonly file = SOURCE_FILE;
}
