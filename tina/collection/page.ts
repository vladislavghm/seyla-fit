import type { Collection } from 'tinacms';
import {
  heroBlockSchema,
  marqueeBlockSchema,
  contentBlockSchema,
  aboutBlockSchema,
  advantagesBlockSchema,
  trainingsBlockSchema,
  pricingBlockSchema,
  faqBlockSchema,
  trialBlockSchema,
  contactsBlockSchema,
} from '@/components/blocks/schemas';

const Page: Collection = {
  label: 'Страницы',
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/${filepath}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Название',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Блоки',
      ui: {
        visualSelector: true,
      },
      templates: [
        heroBlockSchema,
        marqueeBlockSchema,
        contentBlockSchema,
        aboutBlockSchema,
        advantagesBlockSchema,
        trainingsBlockSchema,
        pricingBlockSchema,
        faqBlockSchema,
        trialBlockSchema,
        contactsBlockSchema,
      ],
    },
  ],
};

export default Page;
