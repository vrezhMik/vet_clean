import type { Strapi } from "@strapi/types/dist/core";

import syncVetgroupProducts from "../../src/services/vetgroup-product-sync";

const SYNC_SCHEDULE = '0 * * * *'; 


export default {
  [SYNC_SCHEDULE]: async ({ strapi }: { strapi: Strapi }) => {
    try {
      strapi.log.info("Vetgroup sync cron triggered");
      const message = await syncVetgroupProducts(strapi);
      strapi.log.info(message);
    } catch (error) {
      strapi.log.error("Vetgroup product sync task failed", error);
    }
  },
};
