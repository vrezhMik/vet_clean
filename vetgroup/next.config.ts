import type { NextConfig } from "next";
import sass from "sass";

const isSassLoader = (loaderPath?: string) =>
  Boolean(loaderPath && loaderPath.includes("sass-loader"));

const applySassLoaderOptions = (entry: any, parent: any, index?: number) => {
  const loaderPath = typeof entry === "string" ? entry : entry?.loader;
  if (!isSassLoader(loaderPath)) {
    return;
  }

  const existingOptions =
    typeof entry === "object" && entry.options ? entry.options : {};
  const nextOptions = {
    ...existingOptions,
    implementation: sass,
    api: "modern",
  };

  if (typeof entry === "string") {
    if (typeof index === "number" && Array.isArray(parent?.use)) {
      parent.use[index] = {
        loader: entry,
        options: nextOptions,
      };
    }
  } else if (entry?.options !== nextOptions) {
    entry.options = nextOptions;
  }
};

const traverseRules = (rules?: any[]) => {
  if (!rules) {
    return;
  }

  rules.forEach((rule) => {
    if (!rule) {
      return;
    }

    if (Array.isArray(rule.oneOf)) {
      traverseRules(rule.oneOf);
    }

    if (Array.isArray(rule.use)) {
      rule.use.forEach((useEntry: any, index: number) =>
        applySassLoaderOptions(useEntry, rule, index),
      );
    } else if (rule.use) {
      applySassLoaderOptions(rule.use, rule);
    } else if (rule.loader) {
      applySassLoaderOptions(rule, rule);
    }
  });
};

const nextConfig: NextConfig = {
  images: {
    domains: ["vetgroup.am", "localhost", "127.0.0.1"],
    unoptimized: true,
  },
  webpack(config) {
    traverseRules(config.module?.rules);
    return config;
  },
};

export default nextConfig;
