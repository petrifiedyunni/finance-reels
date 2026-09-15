import type { ContentIdeaSource } from "../interfaces";
import { readJson, resolveFromRoot } from "../utils/fs";
import type { ContentIdea } from "./schema";

export class FileIdeaSource implements ContentIdeaSource {
  constructor(private filePath = resolveFromRoot("content/ideas.json")) {}

  async list(): Promise<ContentIdea[]> {
    return readJson<ContentIdea[]>(this.filePath);
  }
}
