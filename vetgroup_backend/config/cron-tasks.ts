// config/cron-tasks.ts
import type { Core } from '@strapi/strapi';
import syncVetgroupProducts from '../src/services/vetgroup-product-sync';

const SYNC_SCHEDULE = '0 * * * *'; // every hour at minute 0


export default {
  vetgroupSync: {
    task: async ({ strapi }: { strapi: Core.Strapi }): Promise<void> => {
      try {
        strapi.log.info('Vetgroup sync cron triggered');
        const message = await syncVetgroupProducts(strapi);
        strapi.log.info(message);
      } catch (error) {
        strapi.log.error('Vetgroup product sync task failed');
        strapi.log.error(error);
      }
    },
    options: {
      rule: SYNC_SCHEDULE,
    },
  },
};
