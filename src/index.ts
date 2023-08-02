import { ArxivClient } from "./client/client";
import { ArticleMetadata } from "./interface";

export { ArxivClient, ArticleMetadata };

const c = new ArxivClient();
c.getArticle("https://arxiv.org/abs/2106.01401")
