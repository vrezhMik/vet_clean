"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const SYNC_URL = 'http://87.241.165.71:8081/web/hs/Eportal/GET_ITEMS';
const SYNC_AUTH = { username: '001', password: '001' };
const sanitizeNumberField = (value, parser) => {
    if (!value)
        return 0;
    const sanitized = value.replace(',', '.');
    return Number.isNaN(Number(sanitized)) ? 0 : parser(sanitized);
};
const buildPopulate = (keys) => keys.reduce((acc, k) => {
    acc[k] = true;
    return acc;
}, {});
async function syncVetgroupProducts(strapi) {
    var _a;
    const { data } = await axios_1.default.get(SYNC_URL, { auth: SYNC_AUTH });
    const items = (_a = data === null || data === void 0 ? void 0 : data.Items) !== null && _a !== void 0 ? _a : [];
    let createdCount = 0;
    let updatedCount = 0;
    const categories = await strapi.db
        .query('api::category.category')
        .findMany({ select: ['id', 'title'] });
    for (const item of items) {
        const catalogName = item.CatalogName || '';
        const matchedCategory = categories.find((cat) => catalogName.toLowerCase().includes(cat.title.toLowerCase()));
        const fallbackCategory = categories.find((cat) => cat.title.toLowerCase() === 'other');
        const payload = {
            name: catalogName,
            code: item.Articul,
            description: item.Name,
            backendId: item.ID,
            stock: sanitizeNumberField(item.Stock, (v) => parseInt(v, 10)),
            price: sanitizeNumberField(item.Price, (v) => Number.parseFloat(v)),
            category: (matchedCategory === null || matchedCategory === void 0 ? void 0 : matchedCategory.id) || (fallbackCategory === null || fallbackCategory === void 0 ? void 0 : fallbackCategory.id),
            pack_price: sanitizeNumberField(item.pack_price, (v) => parseInt(v, 10)),
        };
        let existing = await strapi.documents('api::product.product').findFirst({
            filters: { backendId: item.ID },
            status: 'published',
        });
        if (!existing) {
            existing = await strapi.documents('api::product.product').findFirst({
                filters: { backendId: item.ID },
                status: 'draft',
            });
        }
        if (existing === null || existing === void 0 ? void 0 : existing.documentId) {
            const productModel = strapi.getModel('api::product.product');
            const mediaKeys = Object.entries(productModel.attributes)
                .filter(([, attr]) => (attr === null || attr === void 0 ? void 0 : attr.type) === 'media')
                .map(([key]) => key);
            const existingFull = await strapi
                .documents('api::product.product')
                .findOne({
                documentId: existing.documentId,
                populate: buildPopulate(mediaKeys),
            });
            const dataToUpdate = { ...payload };
            for (const key of mediaKeys) {
                if (!(key in dataToUpdate) && (existingFull === null || existingFull === void 0 ? void 0 : existingFull[key]) !== undefined) {
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
        }
        catch (err) {
            const msg = String((err === null || err === void 0 ? void 0 : err.message) || err);
            if (msg.includes('must be unique')) {
                const dup = (await strapi.documents('api::product.product').findFirst({
                    filters: { backendId: item.ID },
                    status: 'published',
                })) ||
                    (await strapi.documents('api::product.product').findFirst({
                        filters: { backendId: item.ID },
                        status: 'draft',
                    }));
                if (dup === null || dup === void 0 ? void 0 : dup.documentId) {
                    const productModel = strapi.getModel('api::product.product');
                    const mediaKeys = Object.entries(productModel.attributes)
                        .filter(([, attr]) => (attr === null || attr === void 0 ? void 0 : attr.type) === 'media')
                        .map(([key]) => key);
                    const existingFull = await strapi
                        .documents('api::product.product')
                        .findOne({
                        documentId: dup.documentId,
                        populate: buildPopulate(mediaKeys),
                    });
                    const dataToUpdate = { ...payload };
                    for (const key of mediaKeys) {
                        if (!(key in dataToUpdate) && (existingFull === null || existingFull === void 0 ? void 0 : existingFull[key]) !== undefined) {
                            dataToUpdate[key] = existingFull[key];
                        }
                    }
                    await strapi.documents('api::product.product').update({
                        documentId: dup.documentId,
                        data: dataToUpdate,
                        status: 'published',
                    });
                    updatedCount++;
                }
                else {
                    const dupByCode = (await strapi.documents('api::product.product').findFirst({
                        filters: { code: item.Articul },
                        status: 'published',
                    })) ||
                        (await strapi.documents('api::product.product').findFirst({
                            filters: { code: item.Articul },
                            status: 'draft',
                        }));
                    if (dupByCode === null || dupByCode === void 0 ? void 0 : dupByCode.documentId) {
                        const productModel = strapi.getModel('api::product.product');
                        const mediaKeys = Object.entries(productModel.attributes)
                            .filter(([, attr]) => (attr === null || attr === void 0 ? void 0 : attr.type) === 'media')
                            .map(([key]) => key);
                        const existingFull = await strapi
                            .documents('api::product.product')
                            .findOne({
                            documentId: dupByCode.documentId,
                            populate: buildPopulate(mediaKeys),
                        });
                        const dataToUpdate = { ...payload };
                        for (const key of mediaKeys) {
                            if (!(key in dataToUpdate) && (existingFull === null || existingFull === void 0 ? void 0 : existingFull[key]) !== undefined) {
                                dataToUpdate[key] = existingFull[key];
                            }
                        }
                        await strapi.documents('api::product.product').update({
                            documentId: dupByCode.documentId,
                            data: dataToUpdate,
                            status: 'published',
                        });
                        updatedCount++;
                    }
                    else {
                        throw err;
                    }
                }
            }
            else {
                throw err;
            }
        }
    }
    return `Sync with 1C completed successfully. Created: ${createdCount}, Updated: ${updatedCount}`;
}
exports.default = syncVetgroupProducts;
