import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import type { EmbedOptions } from '@forumulate/embed';

/** Defaults every Forumulate component and the service inherit. */
export type ForumulateConfig = Partial<
  Pick<EmbedOptions, 'org' | 'space' | 'apiBase' | 'theme' | 'locale' | 'accent' | 'radius' | 'width' | 'font' | 'nonce'>
>;

export const FORUMULATE_CONFIG = new InjectionToken<ForumulateConfig>('FORUMULATE_CONFIG');

/**
 *   bootstrapApplication(App, { providers: [provideForumulate({ org: 'acme', space: 'blog' })] });
 */
export function provideForumulate(config: ForumulateConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: FORUMULATE_CONFIG, useValue: config }]);
}
