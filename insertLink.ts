import { getFrontMatterInfo, TFile } from "obsidian";

// フロントマターの直後にリンクを挿入する
export async function insertLink(target: TFile, src: TFile) {
  const content = await this.app.vault.read(target);
  const link = `[[${src.basename}]]`;
  if (content.includes(link)) return;

  const contentStart = getFrontMatterInfo(content).contentStart;
  const modifiedContent =
    content.slice(0, contentStart) + link + "\n" + content.slice(contentStart);
  await this.app.vault.modify(target, modifiedContent);
}
