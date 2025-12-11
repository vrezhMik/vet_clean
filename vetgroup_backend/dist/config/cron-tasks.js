"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vetgroup_product_sync_1 = __importDefault(require("../src/services/vetgroup-product-sync"));
const SYNC_SCHEDULE = '* * * * *'; // every minute
exports.default = {
    vetgroupSync: {
        task: async ({ strapi }) => {
            try {
                strapi.log.info('Vetgroup sync cron triggered');
                const message = await (0, vetgroup_product_sync_1.default)(strapi);
                strapi.log.info(message);
            }
            catch (error) {
                strapi.log.error('Vetgroup product sync task failed');
                strapi.log.error(error);
            }
        },
        options: {
            rule: SYNC_SCHEDULE,
        },
    },
};
