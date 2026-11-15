import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CountUp } from '../../ui/count-up';
import { Icon } from '../../ui/icon';

interface CartKey {
  tenantId: string;
  tenantName: string;
  cartId: string;
  items: number;
  status: string;
  isSelected: boolean;
}

const SAVED_VIEWS = ['all', 'no-ttl', 'big', 'locks', 'device', 'all sessions'];

const KEYS: CartKey[] = [
  { tenantId: '7f3a9c12', tenantName: 'Acme Retail', cartId: 'c0001', items: 3, status: 'CHECKOUT', isSelected: true },
  { tenantId: '7f3a9c12', tenantName: 'Acme Retail', cartId: 'c0002', items: 1, status: 'CHECKOUT', isSelected: false },
  { tenantId: 'b01e44d0', tenantName: 'Vistula Bikes', cartId: 'c0001', items: 2, status: 'OPEN', isSelected: false },
  { tenantId: 'b01e44d0', tenantName: 'Vistula Bikes', cartId: 'c0007', items: 5, status: 'CHECKOUT', isSelected: false },
  { tenantId: 'c93d07aa', tenantName: 'Amber Jewelry', cartId: 'c0003', items: 1, status: 'OPEN', isSelected: false },
  { tenantId: 'e5520b1f', tenantName: 'Polar Outfitters', cartId: 'c0002', items: 4, status: 'CHECKOUT', isSelected: false },
];

const HASH_FIELDS = [
  { name: 'customer', value: 'cus_4410' },
  { name: 'currency', value: 'EUR' },
  { name: 'items', value: '3' },
  { name: 'total', value: '129.00' },
  { name: 'status', value: 'CHECKOUT' },
];

@Component({
  selector: 'opsbuf-keys-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, CountUp],
  template: `
    <div class="views">
      @for (view of savedViews; track view) {
        <span class="view-chip" [class.active]="view === 'no-ttl'">{{ view }}</span>
      }
      <span class="spacer"></span>
      <span class="tool-button"><opsbuf-icon name="columns" [size]="13" /> Patterns</span>
    </div>
    <div class="search-bar">
      <div class="search-line">
        <span class="search">
          <opsbuf-icon name="magnifier" [size]="14" />
          <span class="typed" style="--chars: 17">cart:* ttl = none</span>
          <span class="caret"></span>
        </span>
        <span class="tool-button in-values">In values</span>
        <span class="tool-button">Update</span>
      </div>
      <div class="hint">
        → <span class="mono">SCAN MATCH cart:*</span> <i class="node-dot"></i> on 3 nodes, fetches 200 at a time
      </div>
    </div>
    <div class="summary">
      <span class="pending"></span>
      <span class="total">6 keys · 1.1 kB</span>
      <span class="period">
        scanned <span [opsbufCountUp]="3720" separator="," [delayMs]="1700"></span> of 3,720 keys · 3 nodes ·
        <b>120 ms</b>
      </span>
    </div>
    <div class="split">
      <div class="keys mono">
        <div class="row head">
          <span>key</span><span class="tenant">tenant_id</span><span class="cart">cart_id</span>
          <span class="number items">items</span><span class="state">status</span><span class="ttl">ttl</span>
        </div>
        @for (key of keys; track key.tenantId + key.cartId) {
          <div class="row" [class.selected]="key.isSelected" [style.--i]="$index">
            <span class="key-name">cart:<b>{{ key.tenantId }}</b>:<b>{{ key.cartId }}</b></span>
            <span class="tenant"><b class="swapped"><opsbuf-icon name="tag" [size]="10" />{{ key.tenantName }}</b></span>
            <span class="cart">{{ key.cartId }}</span><span class="number items">{{ key.items }}</span>
            <span class="state">{{ key.status }}</span><span class="ttl">none</span>
          </div>
        }
      </div>
      <div class="value">
        <div class="value-head">
          <span class="value-key mono">cart:7f3a9c12:c0001</span>
          <span class="tool-button small">Copy</span>
        </div>
        <div class="value-meta">
          <span>hash · 5 fields</span><span>TTL <b>none</b></span><span>192 B</span>
          <span>node <b class="mono">10.244.1.45:6379</b></span>
        </div>
        <div class="value-tools">
          <span class="tool-button small"><opsbuf-icon name="eye" [size]="12" /> Watch</span>
          <span class="tool-button small">Raw</span>
          <span class="tool-button small"><opsbuf-icon name="filter" [size]="12" /> Filter</span>
        </div>
        <div class="hash mono">
          @for (field of hashFields; track field.name) {
            <div [style.--i]="$index"><span>{{ field.name }}</span><span>{{ field.value }}</span></div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './keys-scene.scss',
})
export class KeysScene {
  protected readonly savedViews = SAVED_VIEWS;
  protected readonly keys = KEYS;
  protected readonly hashFields = HASH_FIELDS;
}
