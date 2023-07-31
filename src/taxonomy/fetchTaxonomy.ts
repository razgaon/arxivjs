import { JSDOM } from 'jsdom';

export class ArxivTaxonomyCrawler {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  public async getTaxonomy(): Promise<Record<string, string>> {
    try {
      const response = await fetch(this.url);
      const body = await response.text()
      const dom = new JSDOM(body);
      const parents = dom.window.document.querySelectorAll('h4');
      const mapping: Record<string, string> = {};

      parents.forEach((parent) => {
        const id = parent.childNodes[0].textContent?.trim() || '';
        const nameElement = parent.querySelector('span');
        let name: string | null = null;
        
        if (nameElement) {
          name = nameElement.textContent?.trim().replace('(', '').replace(')', '') || null;
        }
        
        if (id && name) {
          mapping[id] = name;
        }
      });

      return mapping;
    } catch (error) {
      console.error(`Failed to fetch the webpage. Error: ${error}`);
      throw error;
    }
  }
}