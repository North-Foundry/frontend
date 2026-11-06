import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Privacy policies, one Markdown file per app in `src/content/privacy`, each served at
 * `/privacy/<file name>/`. The frontmatter holds the page header and the short version; the body
 * holds the full policy, one `##` section per topic.
 */
const privacy = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/privacy' }),
  schema: z.object({
    /** The app's name, as it appears in the label and the page title. */
    app: z.string(),
    /** The platform the app runs on, such as "iOS". */
    platform: z.string(),
    /** The headline: the policy's promise in one sentence. */
    title: z.string(),
    /** One or two sentences under the headline. */
    lede: z.string(),
    /** What the app is, so the reader knows what the policy covers. */
    scope: z.string(),
    /** The date of the last change that affects what the policy says. */
    updated: z.coerce.date(),
    /** The short version: three statements a reader can trust without reading further. */
    summary: z.array(z.string()).min(1),
  }),
});

export const collections = { privacy };
