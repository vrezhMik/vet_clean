/**
 * custom vetgroup-product router
 */

export default {
  routes: [
    {
      method: "PUT",
      path: "/vetgroup-product/:id",
      handler: "vetgroup-product.update",
      config: {
        policies: [],
      },
    },
  ],
};

