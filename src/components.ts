/**
 * Standalone components, one per `<forumulate-*>` custom element from
 * @forumulate/embed. Each creates its element as a child of its host with
 * Renderer2 and keeps the element's attributes in step with its inputs; the
 * element owns mounting, re-rendering and teardown. Renderer2 also runs under
 * Angular SSR, so the server emits the element and the browser brings it alive.
 *
 * Host selectors are `fm-*` so they never collide with the custom-element tags.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  Renderer2,
  inject,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { defineForumulateElements, type FeedItem, type FeedKind, type Theme } from '@forumulate/embed';
import { FORUMULATE_CONFIG } from './config.js';

const BASE_ATTRS: Record<string, string> = {
  org: 'org',
  space: 'space',
  apiBase: 'api',
  theme: 'theme',
  locale: 'locale',
  accent: 'accent',
  radius: 'radius',
  width: 'width',
  font: 'font',
  nonce: 'nonce',
};

@Directive()
export abstract class ForumulateEmbedBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() org?: string;
  @Input() space?: string;
  @Input() apiBase?: string;
  @Input() theme?: Theme;
  @Input() locale?: string;
  @Input() accent?: string;
  @Input() radius?: string;
  @Input() width?: string;
  @Input() font?: string;
  @Input() nonce?: string;
  /** The embed rendered (feed: the items it shows). */
  @Output() readonly load = new EventEmitter<unknown>();
  /** The hosted script or the API could not be reached. */
  @Output() readonly error = new EventEmitter<unknown>();

  protected abstract readonly elementName: string;
  /** Extra prop → attribute pairs for this kind. */
  protected abstract extraAttrs(): Record<string, unknown>;

  private readonly renderer = inject(Renderer2);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(FORUMULATE_CONFIG, { optional: true }) ?? {};
  private el?: HTMLElement;
  private unlisten: (() => void)[] = [];

  ngOnInit(): void {
    this.sync();
  }

  ngOnChanges(): void {
    if (this.el) this.sync();
  }

  ngAfterViewInit(): void {
    if (!this.browser || !this.el) return;
    defineForumulateElements();
    this.unlisten.push(
      this.renderer.listen(this.el, 'forumulate:load', (e: CustomEvent) => this.load.emit(e.detail)),
      this.renderer.listen(this.el, 'forumulate:error', (e: CustomEvent) => this.error.emit(e.detail)),
    );
  }

  ngOnDestroy(): void {
    for (const off of this.unlisten) off();
    this.unlisten = [];
  }

  private sync(): void {
    if (!this.el) {
      this.el = this.renderer.createElement(this.elementName) as HTMLElement;
      this.renderer.appendChild(this.host.nativeElement, this.el);
    }
    const values: Record<string, unknown> = { ...this.config };
    for (const key of Object.keys(BASE_ATTRS)) {
      const v = (this as unknown as Record<string, unknown>)[key];
      if (v !== undefined) values[key] = v;
    }
    const attrs: [string, unknown][] = [
      ...Object.entries(BASE_ATTRS).map(([k, name]) => [name, values[k]] as [string, unknown]),
      ...Object.entries(this.extraAttrs()),
    ];
    for (const [name, v] of attrs) {
      if (v === undefined || v === null || v === '') this.renderer.removeAttribute(this.el, name);
      else this.renderer.setAttribute(this.el, name, String(v));
    }
  }
}

@Component({
  selector: 'fm-comments',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumulateCommentsComponent extends ForumulateEmbedBase {
  /** Topic slug; omit to resolve one thread per article URL. */
  @Input() topic?: string;
  @Input() articleUrl?: string;
  protected readonly elementName = 'forumulate-comments';
  protected extraAttrs() {
    return { topic: this.topic, 'article-url': this.articleUrl };
  }
}

@Component({
  selector: 'fm-widget',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumulateWidgetComponent extends ForumulateEmbedBase {
  @Input() mode?: 'search' | 'ask';
  @Input() placeholder?: string;
  protected readonly elementName = 'forumulate-widget';
  protected extraAttrs() {
    return { mode: this.mode, placeholder: this.placeholder };
  }
}

@Component({
  selector: 'fm-search',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumulateSearchComponent extends ForumulateEmbedBase {
  @Input() placeholder?: string;
  protected readonly elementName = 'forumulate-search';
  protected extraAttrs() {
    return { placeholder: this.placeholder };
  }
}

@Component({
  selector: 'fm-changelog',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumulateChangelogComponent extends ForumulateEmbedBase {
  protected readonly elementName = 'forumulate-changelog';
  protected extraAttrs() {
    return {};
  }
}

@Component({
  selector: 'fm-feed',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumulateFeedComponent extends ForumulateEmbedBase {
  @Input() kind?: FeedKind;
  @Input() limit?: number;
  @Input() tag?: string;
  @Input() category?: string;
  /** Link template, e.g. `/blog/{slug}`. Default: the Forumulate reader page. */
  @Input() href?: string;
  @Input() excerpts?: boolean;
  protected readonly elementName = 'forumulate-feed';
  protected extraAttrs() {
    return {
      kind: this.kind,
      limit: this.limit,
      tag: this.tag,
      category: this.category,
      href: this.href,
      excerpts: this.excerpts,
    };
  }
}

/** Every component, for `imports: [...FORUMULATE_COMPONENTS]`. */
export const FORUMULATE_COMPONENTS = [
  ForumulateCommentsComponent,
  ForumulateWidgetComponent,
  ForumulateSearchComponent,
  ForumulateChangelogComponent,
  ForumulateFeedComponent,
] as const;

export type { FeedItem };
