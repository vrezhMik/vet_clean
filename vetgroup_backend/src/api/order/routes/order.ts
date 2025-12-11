export default {
  routes: [
    {
      method: "POST",
      path: "/order",
      handler: "order.create",
      config: {
        policies: [],
      },
    },
  ],
};
