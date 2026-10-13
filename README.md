# @forumulate/angular

Forumulate in Angular: standalone components for embedded comments, docs
search / ask-AI, a "What's new" changelog bell and a content feed, plus an
injectable `ForumulateService` over the public read API. Built on
[`@forumulate/embed`](https://www.npmjs.com/package/@forumulate/embed);
Angular 17+, SSR-safe.

## Install

```sh
npm install @forumulate/angular
```

## A component

```ts
// main.ts
import { provideForumulate } from '@forumulate/angular';
bootstrapApplication(AppComponent, {
  providers: [provideForumulate({ org: 'acme', space: 'blog', theme: 'auto' })],
});

// post.component.ts
import { Component } from '@angular/core';
import { ForumulateCommentsComponent } from '@forumulate/angular';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [ForumulateCommentsComponent],
  template: `<article>…</article>
    <fm-comments (load)="ready = true" />`,
})
export class PostComponent {
  ready = false;
}
```

Also `<fm-widget mode="ask">`, `<fm-search>`, `<fm-changelog>` and
`<fm-feed kind="posts" [limit]="5" href="/blog/{slug}">` (`FORUMULATE_COMPONENTS`
imports them all). Every input (`org`, `space`, `apiBase`, `theme`, `locale`,
`accent`, …) overrides the provided defaults.

## Content

```ts
import { inject } from '@angular/core';
import { ForumulateService } from '@forumulate/angular';

export class BlogComponent {
  private forumulate = inject(ForumulateService);
  posts = this.forumulate.listPosts({ limit: 10 }); // Promise<Paged<ArticleSummary>>
}
```

Also `getPage`, `getPageMarkdown`, `listPages`, `getPost`, `listTopics`,
`getTopic`, `listReleases`, `search`, and `client({ space: 'docs' })` for
another space. `apiBase` defaults to `https://forumulate.com/api`.

## License

MIT

---

## About this repository

This repository is a public mirror, refreshed on each Forumulate release
(one commit per release). Pull requests are welcome; accepted changes are
applied upstream and arrive here with the next release.

- API reference: https://forumulate.com/reference
- Guides: https://forumulate.com/guides
- Community and support: https://forumulate.com/community
- Source: https://github.com/forumulate/angular
