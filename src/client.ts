import FeedMe from "feedme";
import http from "http";
import { taxonomyData } from "./taxonomy";

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

  private getAuthors(s: Array<any> | any): string {
    if (Array.isArray(s)) {
      return s.map((x: any) => x.name).join(", ");
    } else {
      return s.name;
    }
  }

  private getCategoryIds(s: Array<any> | any): string {
    if (Array.isArray(s)) {
      return s.map((x: any) => x.term).join(", ");
    } else {
      return s.term;
    }
  }

  private getCategoryNames(s: Array<any> | any): string {
    if (Array.isArray(s)) {
      return s.map((x: any) => taxonomyData[x.term] ?? "Unknown").join(", ");
    } else {
      return taxonomyData[s.term];
    }
  }

  private parseItem(item: any): any {
    return {
      id: item.id,
      title: item.title,
      authors: this.getAuthors(item.author),
      summary: item.summary,
      journal_ref: item["arxiv:journal_ref"]?.text ?? "None",
      category_ids: this.getCategoryIds(item["arxiv:primary_category"]),
      category_names: this.getCategoryNames(item["arxiv:primary_category"]),
      pdf_link: item.link.filter((x: any) => x.title === "pdf")[0].href,
    };
  }

  private getArticleIdFromUrl(url: string): string {
    /**
     * Returns the article's arXiv ID from its URL.
     *
     * url: The article's arXiv URL.
     */
    let id = url.split("/").pop();
    id = id.replace(".pdf", "");

    return id;
  }

  async getArticle(idOrUrl: string) {
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
