import axios from "axios";

export default ({ strapi }) => ({
  async syncItems() {
    const { data } = await axios.get(
      "http://87.241.165.71:8081/web/hs/Eportal/GET_ITEMS",
      {
        auth: {
          username: "001",
          password: "001",
        },
      },
    );

    const items = data.Items;

    let createdCount = 0;
    let updatedCount = 0;

    const categories = await strapi.db
      .query("api::category.category")
      .findMany({ select: ["id", "title"] });
    const productDocumentService = strapi.documents("api::product.product");

    for (const item of items) {
      const catalogName = item.CatalogName || "";

      const matchedCategory = categories.find((cat) =>
        catalogName.toLowerCase().includes(cat.title.toLowerCase()),
      );

      const fallbackCategory = categories.find(
        (cat) => cat.title.toLowerCase() === "other",
      );

      const payload = {
        name: catalogName,
        code: item.Articul,
        description: item.Name,
        backendId: item.ID,
        stock: item.Stock ? parseInt(item.Stock.replace(",", "."), 10) : 0,
        price: item.Price ? parseFloat(item.Price.replace(",", ".")) : 0,
        category: matchedCategory?.id || fallbackCategory?.id,
        pack_price: item.pack_price
          ? parseInt(item.pack_price.replace(",", "."))
          : 0,
      };

      const existing = await strapi.db.query("api::product.product").findOne({
        select: ["id", "documentId"],
        where: { backendId: item.ID },
      });

      if (existing) {
        if (existing.documentId) {
          await productDocumentService.update({
            documentId: existing.documentId,
            data: payload,
            status: "published",
          });
        } else {
          await strapi.db.query("api::product.product").update({
            where: { id: existing.id },
            data: payload,
          });
        }

        updatedCount++;
      } else {
        await productDocumentService.create({
          data: payload,
          status: "published",
        });
        createdCount++;
      }
    }

    return `Sync with 1C completed successfully. Created: ${createdCount}, Updated: ${updatedCount}`;
  },
});
