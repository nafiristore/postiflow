// Postiflow — Platform Poster
// Handles auto-posting to Instagram and TikTok via official APIs.
// For MVP: returns mock responses. Real platform integration is Phase 2.

import { type ContentItem, type ContentPlatform } from "./mock-data";

export type PostResult = {
  success: boolean;
  platform_post_id?: string;
  error?: string;
};

/**
 * Post a content item to the specified platform.
 * For MVP: returns mock success.
 *
 * Real implementation (Phase 2) will:
 * - IG: use Instagram Graph API (https://graph.instagram.com/v18.0/{ig-user-id}/media)
 *   - 2-step: create container → publish
 * - TikTok: use TikTok Content Posting API (https://open.tiktokapis.com/v2/post/publish/video/init/)
 *   - Requires user OAuth + video upload
 */
export async function postToPlatform(item: ContentItem): Promise<PostResult> {
  // TODO: replace with real API calls when credentials available
  // For now, simulate success for non-failed items
  if (item.status === "failed") {
    return {
      success: false,
      error: "Item marked as failed — retry needed",
    };
  }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  // Mock success
  return {
    success: true,
    platform_post_id: `${item.platform}_mock_${Date.now()}`,
  };
}

/**
 * Post a batch of items in sequence.
 */
export async function postBatch(items: ContentItem[]): Promise<PostResult[]> {
  const results: PostResult[] = [];
  for (const item of items) {
    const result = await postToPlatform(item);
    results.push(result);
  }
  return results;
}
