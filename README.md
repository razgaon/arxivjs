# arxivjs

This repo allows users to fetch parsed metadata from arxiv using the ArxivClient

Code example:

```js
import { ArxivClient, ArticleMetadata } from "arxivjs";
const articleMetadata: ArticleMetadata = await client.getArticle(searchText);
```

Note that searchText can either be an Arxiv url or an article ID.
