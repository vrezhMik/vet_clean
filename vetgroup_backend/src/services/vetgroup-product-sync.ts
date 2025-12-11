import axios from 'axios';
import type { Core } from '@strapi/strapi';

const SYNC_URL = 'http://87.241.165.71:8081/web/hs/Eportal/GET_ITEMS';
const SYNC_AUTH = { username: '001', password: '001' };

const sanitizeNumberField = (
  value: string | undefined,
  parser: (v: string) => number,
) => {
  if (!value) return 0;
  const sanitized = value.replace(',', '.');
  return Number.isNaN(Number(sanitized)) ? 0 : parser(sanitized);
};

const buildPopulate = (keys: string[]) =>
  keys.reduce<Record<string, true>>((acc, k) => {
    acc[k] = true;
    return acc;
  }, {});

export default async function syncVetgroupProducts(strapi: Core.Strapi) {
  const { data } = await axios.get(SYNC_URL, { auth: SYNC_AUTH });
  const items = data?.Items ?? [];

  let createdCount = 0;
  let updatedCount = 0;

  const categories = await strapi.db
    .query('api::category.category')
    .findMany({ select: ['id', 'title'] });

  for (const item of items) {
    const catalogName = item.CatalogName || '';

    const matchedCategory = categories.find((cat) =>
      catalogName.toLowerCase().includes(cat.title.toLowerCase()),
    );
    const fallbackCategory = categories.find(
      (cat) => cat.title.toLowerCase() === 'other',
    );

    const payload = {
      name: catalogName,
      code: item.Articul,
      description: item.Name,
      backendId: item.ID,
      stock: sanitizeNumberField(item.Stock, (v) => parseInt(v, 10)),
      price: sanitizeNumberField(item.Price, (v) => Number.parseFloat(v)),
      category: matchedCategory?.id || fallbackCategory?.id,
      pack_price: sanitizeNumberField(item.pack_price, (v) => parseInt(v, 10)),
    };

    let existing =
      await strapi.documents('api::product.product').findFirst({
        filters: { backendId: item.ID },
        status: 'published',
      });

    if (!existing) {
      existing = await strapi.documents('api::product.product').findFirst({
        filters: { backendId: item.ID },
        status: 'draft',
      });
    }

    if (existing?.documentId) {
      const productModel = strapi.getModel('api::product.product');
      const mediaKeys = Object.entries(productModel.attributes)
        .filter(([, attr]: any) => attr?.type === 'media')
        .map(([key]) => key as string);

      const existingFull = await strapi
        .documents('api::product.product')
        .findOne({
          documentId: existing.documentId,
          populate: buildPopulate(mediaKeys),
        });

      const dataToUpdate: Record<string, any> = { ...payload };
      for (const key of mediaKeys) {
        if (!(key in dataToUpdate) && existingFull?.[key] !== undefined) {
          dataToUpdate[key] = existingFull[key];
        }
      }

      await strapi.documents('api::product.product').update({
        documentId: existing.documentId,
        data: dataToUpdate,
        status: 'published',
      });
      updatedCount++;
      continue;
    }

    try {
      await strapi.documents('api::product.product').create({
        data: payload,
        status: 'published',
      });
      createdCount++;
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('must be unique')) {
        const dup =
          (await strapi.documents('api::product.product').findFirst({
            filters: { backendId: item.ID },
            status: 'published',
          })) ||
          (await strapi.documents('api::product.product').findFirst({
            filters: { backendId: item.ID },
            status: 'draft',
          }));

        if (dup?.documentId) {
          const productModel = strapi.getModel('api::product.product');
          const mediaKeys = Object.entries(productModel.attributes)
            .filter(([, attr]: any) => attr?.type === 'media')
            .map(([key]) => key as string);

          const existingFull = await strapi
            .documents('api::product.product')
            .findOne({
              documentId: dup.documentId,
              populate: buildPopulate(mediaKeys),
            });

          const dataToUpdate: Record<string, any> = { ...payload };
          for (const key of mediaKeys) {
            if (!(key in dataToUpdate) && existingFull?.[key] !== undefined) {
              dataToUpdate[key] = existingFull[key];
            }
          }

          await strapi.documents('api::product.product').update({
            documentId: dup.documentId,
            data: dataToUpdate,
            status: 'published',
          });
          updatedCount++;
        } else {
          const dupByCode =
            (await strapi.documents('api::product.product').findFirst({
              filters: { code: item.Articul },
              status: 'published',
            })) ||
            (await strapi.documents('api::product.product').findFirst({
              filters: { code: item.Articul },
              status: 'draft',
            }));

          if (dupByCode?.documentId) {
            const productModel = strapi.getModel('api::product.product');
            const mediaKeys = Object.entries(productModel.attributes)
              .filter(([, attr]: any) => attr?.type === 'media')
              .map(([key]) => key as string);

            const existingFull = await strapi
              .documents('api::product.product')
              .findOne({
                documentId: dupByCode.documentId,
                populate: buildPopulate(mediaKeys),
              });

            const dataToUpdate: Record<string, any> = { ...payload };
            for (const key of mediaKeys) {
              if (!(key in dataToUpdate) && existingFull?.[key] !== undefined) {
                dataToUpdate[key] = existingFull[key];
              }
            }

            await strapi.documents('api::product.product').update({
              documentId: dupByCode.documentId,
              data: dataToUpdate,
              status: 'published',
            });
            updatedCount++;
          } else {
            throw err;
          }
        }
      } else {
        throw err;
      }
    }
  }

  return `Sync with 1C completed successfully. Created: ${createdCount}, Updated: ${updatedCount}`;
}
