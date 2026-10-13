/**
 * The public read API as an injectable. Methods return Promises (use them with
 * `await`, the `async` pipe, or wrap in rxjs `from()`); `client()` gives a
 * client for another space. Works under SSR and prerendering: it only uses `fetch`.
 */
import { Injectable, inject } from '@angular/core';
import {
  createClient,
  type Article,
  type ArticleSummary,
  type ClientOptions,
  type ForumulateClient,
  type ListOptions,
  type Page,
  type PageOptions,
  type PageSummary,
  type Paged,
  type SearchResult,
  type TopicListOptions,
} from '@forumulate/embed';
import { FORUMULATE_CONFIG } from './config.js';

@Injectable({ providedIn: 'root' })
export class ForumulateService {
  private readonly config = inject(FORUMULATE_CONFIG, { optional: true }) ?? {};
  private defaultClient?: ForumulateClient;

  /** A client for the configured org/space, or for the overrides given. */
  client(overrides: Partial<ClientOptions> = {}): ForumulateClient {
    if (!Object.keys(overrides).length) {
      return (this.defaultClient ??= this.make({}));
    }
    return this.make(overrides);
  }

  private make(overrides: Partial<ClientOptions>): ForumulateClient {
    const c = this.config;
    return createClient({
      org: overrides.org ?? c.org ?? '',
      space: overrides.space ?? c.space ?? '',
      apiBase: overrides.apiBase ?? c.apiBase,
      locale: overrides.locale ?? c.locale,
      ...overrides,
    } as ClientOptions);
  }

  getPage(slugOrId: string, o?: PageOptions): Promise<Page> {
    return this.client().getPage(slugOrId, o);
  }
  getPageMarkdown(slugOrId: string, o?: PageOptions): Promise<string> {
    return this.client().getPageMarkdown(slugOrId, o);
  }
  listPages(o?: PageOptions): Promise<PageSummary[]> {
    return this.client().listPages(o);
  }
  listPosts(o?: ListOptions): Promise<Paged<ArticleSummary>> {
    return this.client().listPosts(o);
  }
  getPost(slug: string): Promise<Article> {
    return this.client().getPost(slug);
  }
  listTopics(o?: TopicListOptions): Promise<Paged<ArticleSummary>> {
    return this.client().listTopics(o);
  }
  getTopic(slug: string): Promise<Article> {
    return this.client().getTopic(slug);
  }
  listReleases(o?: ListOptions): Promise<Paged<Article>> {
    return this.client().listReleases(o);
  }
  search(q: string, o?: { limit?: number }): Promise<SearchResult> {
    return this.client().search(q, o);
  }
}
