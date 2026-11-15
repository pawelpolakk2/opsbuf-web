import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { highlightCode } from '../ui/highlight';
import { Icon } from '../ui/icon';
import { Logo } from '../ui/logo';
import { Reveal } from '../ui/reveal';
import { HERO_SPECS, MODULES, PRINCIPLES, QUESTIONS, SECURITY, SPOTLIGHTS, WORKFLOW, WorkflowStep } from './content';
import { PricingSection } from './pricing-section';
import { Showcase } from './showcase/showcase';

const SHORTCUTS = [
  { keys: ['⌘', '1…9'], action: 'switch environment' },
  { keys: ['⌘', 'B'], action: 'toggle side panel / go to definition' },
  { keys: ['⌘', '↵'], action: 'run the script' },
  { keys: ['j', 'k'], action: 'move in lists' },
  { keys: ['⌘', 'W'], action: 'close tab' },
];

@Component({
  selector: 'opsbuf-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo, Reveal, Showcase, PricingSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly heroSpecs = HERO_SPECS;
  protected readonly principles = PRINCIPLES;
  protected readonly spotlights = SPOTLIGHTS.map((spotlight) => ({
    ...spotlight,
    html: highlightCode(spotlight.sample.code, spotlight.sample.language),
  }));
  protected readonly modules = MODULES;
  protected readonly workflow = WORKFLOW.map((step) => ({
    ...step,
    html: highlightCode(step.sample.code, step.sample.language),
  }));
  protected readonly security = SECURITY;
  protected readonly questions = QUESTIONS;
  protected readonly shortcuts = SHORTCUTS;

  protected isTerminal(step: WorkflowStep): boolean {
    return step.sample.language === 'shell';
  }
}
