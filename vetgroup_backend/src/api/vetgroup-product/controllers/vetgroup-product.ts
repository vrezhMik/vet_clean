/**
 * custom vetgroup-product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async update(ctx) {
      const { id } = ctx.params;
      const data = ctx.request.body;

      const entity = await strapi
        .service("api::product.product")
        .update(id, { data });

      return this.transformResponse(entity);
    },
  })
);

