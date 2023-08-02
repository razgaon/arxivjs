import FeedMe from "feedme";
import http from "http";
import { taxonomyData } from "../taxonomy/taxonomy";
import { ArticleMetadata } from "../interface";

export class ArxivClient {
  private static readonly QUERY_URL_FORMAT = `http://export.arxiv.org/api/query?`;

  constructor(
    private delaySeconds: number = 3,
    private numRetries: number = 3
  ) {
    this.parseItem = this.parseItem.bind(this);
  }

  /**
   * Returns the name of the class and the values of its attributes.
   */
  toString(): string {
    return `${this.constructor.name}(delaySeconds=${this.delaySeconds}, numRetries=${this.numRetries})`;
  }

  private getAuthors(authors: Array<any> | any): string[] {
    if (Array.isArray(authors)) {
      return authors.map((x: any) => x.name);
    } else {
      return [authors.name];
    }
  }

  private getCategoryIds(categories: Array<any> | any): string[] {
    if (Array.isArray(categories)) {
      return categories.map((x: any) => x.term);
    } else {
      return categories.term;
    }
  }

  private getCategoryNames(categories: Array<any> | any): string[] {
    if (Array.isArray(categories)) {
      return categories.map((x: any) => taxonomyData[x.term] ?? "Unknown");
    } else {
      return [taxonomyData[categories.term]];
    }
  }

  private parseItem(item: any): ArticleMetadata {
    return {
      id: item.id,
      title: item.title,
      authors: this.getAuthors(item.author),
      summary: item.summary,
      journal: item["arxiv:journal_ref"]?.text ?? "None",
      categoryNames: this.getCategoryNames(item["arxiv:primary_category"]),
      pdf: item.link.filter((x: any) => x.title === "pdf")[0].href,
    };
  }

  private getArticleIdFromUrl(url: string): string {
    /**
     * Returns the article's arXiv ID from its URL.
     *
     * url: The article's arXiv URL.
     */
    let id = url.split("/").pop();
    id = id.split("?")[0]
    id = id.replace(".pdf", "");

    return id;
  }

  async getArticle(idOrUrl: string): Promise<ArticleMetadata> {
    /**
     * Returns a promise that resolves to an object containing the article's metadata.
     *
     * id: The article's arXiv ID.
     */
    let id = idOrUrl;
    if (idOrUrl.startsWith("http")) {
      id = this.getArticleIdFromUrl(idOrUrl);
    }

    console.log(`Fetching ${id}...`);

    return new Promise((resolve, reject) => {
      http.get(ArxivClient.QUERY_URL_FORMAT + `id_list=${id}`, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`status code ${res.statusCode}`));
          return;
        }

        let parser = new FeedMe();

        parser.on("item", (item) => {
          const x = this.parseItem(item);
          resolve(x);
        });

        parser.on("error", reject);

        res.pipe(parser);
      });
    });
  }
}
