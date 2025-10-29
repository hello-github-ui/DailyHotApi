import RSSParser from "rss-parser";
import logger from "./logger.js";

/**
 * 提取 RSS 内容
 * @param content HTML 内容
 * @returns RSS 内容
 */
export const extractRss = (content: string): string | null => {
    // 匹配 <rss> 标签及内容
    const rssRegex = /(<rss[\s\S]*?<\/rss>)/i;
    const matches = content.match(rssRegex);
    return matches ? matches[0] : null;
};

/**
 * 解析 RSS 内容
 * @param rssContent RSS 内容
 * @returns 解析后的 RSS 内容
 */
export const parseRSS = async (rssContent: string) => {
    const parser = new RSSParser();
    // 是否为网址
    const isUrl = (url: string) => {
        try {
            new URL(url);
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    };
    try {
        // 1) 直解析 URL 或字符串
        let contentToParse = rssContent;
        if (!isUrl(rssContent) && typeof rssContent === "string") {
            // 部分站点会在 <rss> 外包裹 HTML，先提取真正的 <rss> 片段
            const extracted = extractRss(rssContent);
            if (extracted) contentToParse = extracted;
            // 常见非法字符修正：将裸 & 转义，避免 Unexpected close tag 等异常
            // 仅在看起来不是 URL 且包含 <rss 时做轻度清洗
            if (/^\s*</.test(contentToParse)) {
                contentToParse = contentToParse.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, "&amp;");
            }
        }

        const feed = isUrl(contentToParse)
            ? await parser.parseURL(contentToParse)
            : await parser.parseString(contentToParse);
        const items = feed.items.map((item) => ({
            title: item.title, // 文章标题
            link: item.link, // 文章链接
            pubDate: item.pubDate, // 发布日期
            author: item.creator ?? item.author, // 作者
            content: item.content, // 内容
            contentSnippet: item.contentSnippet, // 内容摘要
            guid: item.guid, // 全局唯一标识符
            categories: item.categories, // 分类
        }));
        // 返回解析数据
        return items;
    } catch (error) {
        // 二次尝试：若第一次失败，再强制仅提取 <rss> 内容解析一次
        try {
            const extracted = extractRss(rssContent);
            if (extracted) {
                const feed = await parser.parseString(extracted);
                return feed.items.map((item) => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.creator ?? item.author,
                    content: item.content,
                    contentSnippet: item.contentSnippet,
                    guid: item.guid,
                    categories: item.categories,
                }));
            }
        } catch { }
        logger.error("❌ [RSS] An error occurred while parsing RSS content");
        throw error;
    }
};
